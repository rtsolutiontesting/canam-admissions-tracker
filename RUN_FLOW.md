# Step-by-Step Execution Flow

## Overview

This document describes the detailed execution flow of the University Admissions Tracker system.

## Pre-execution Setup

1. **Environment Configuration**
   - Load `.env` file
   - Validate required environment variables
   - Initialize service account credentials

2. **Service Initialization**
   - Initialize Google Sheets API client
   - Initialize Firebase Admin SDK
   - Initialize AI service (Gemini)
   - Initialize comparison service

3. **Sheet Validation**
   - Check if required columns exist
   - Add missing columns if needed
   - Verify sheet access permissions

## Main Execution Flow

### Step 1: Create Execution Log
```
Action: Create new execution log in Firebase
Collection: executionLogs
Document ID: exec_{timestamp}_{random}
Fields:
  - executionId: Generated ID
  - startTime: Current timestamp
  - totalPrograms: 0 (initial)
  - successful: 0
  - failed: 0
  - errors: []
```

### Step 2: Read Program Rows
```
Action: Read all program rows from Google Sheet
Range: A2:Q1000 (adjust as needed)
Process:
  - Parse each row into ProgramRow object
  - Skip rows without universityName or programName
  - Store row index for later updates
Result: Array of ProgramRow objects
```

### Step 3: Update Execution Log (Initial)
```
Action: Update execution log with total program count
Fields:
  - totalPrograms: Length of program rows array
```

### Step 4: Process Each Program (Loop)

For each program row:

#### 4.1: Generate Program ID
```
Action: Create unique program identifier
Format: {universityName}_{programName}
Sanitize: Replace non-alphanumeric with underscore
Example: "MIT - CS" → "MIT_CS"
```

#### 4.2: Check Rate Limit
```
Action: Check Firebase rate limit status
Collection: rateLimits
Document: requests
Process:
  - Check minuteCount < 60
  - Check hourCount < 1000
  - Reset counters if time window passed
  - Increment counters if allowed
Result: { allowed: boolean, resetAt?: Date }
If not allowed: Wait until resetAt, then retry
```

#### 4.3: Get Last Snapshot
```
Action: Fetch last known snapshot from Firebase
Collection: programSnapshots
Document ID: programId
Result: ProgramSnapshot | null
```

#### 4.4: Extract Data from URL
```
Action: Fetch and extract data from admissions page
Process:
  4.4.1: Validate URL
    - Check if URL starts with http/https
    - If invalid: Return FETCH_ERROR
  
  4.4.2: Fetch URL (with retries)
    - Attempt 1: Fetch with 30s timeout
    - If fails: Wait 2s, retry
    - Attempt 2: Retry fetch
    - If fails: Wait 4s, retry
    - Attempt 3: Final retry
    - If all fail: Return FETCH_ERROR
  
  4.4.3: Clean HTML
    - Remove <script> tags
    - Remove <style> tags
    - Strip HTML tags
    - Normalize whitespace
    - Limit to 50,000 characters
  
  4.4.4: AI Extraction
    - Build prompt with context
    - Send to Gemini API
    - Parse JSON response
    - Sanitize extracted data
    - Validate field values
  
  4.4.5: Check Results
    - If all fields are NOT_FOUND:
      - Try official source search (optional)
      - If still not found: Return NOT_FOUND status
    - Otherwise: Return SUCCESS status

Result: { data: ExtractedData, status: ExtractionStatus, errorMessage?: string }
```

#### 4.5: Compare Data
```
Action: Compare extracted data with existing data
Input:
  - extractedData: Newly extracted data
  - existingRow: Current sheet row
  - lastSnapshot: Last Firebase snapshot (if exists)

Process:
  For each field (intakeOffered, intakeStatus, etc.):
    1. Get new value from extractedData
    2. Get old value from existingRow (preferred) or lastSnapshot
    3. Compare values
    4. If different:
       - Determine change type:
         - NEW: oldValue is empty, newValue is not NOT_FOUND
         - NOT_FOUND: newValue is NOT_FOUND, oldValue exists
         - CHANGED: Otherwise
       - Add to changes array

Result: ComparisonResult
  - hasChanges: boolean
  - changes: FieldChange[]
  - newData: ExtractedData
  - oldData: ExtractedData | null
```

#### 4.6: Update Google Sheet
```
Action: Update row in Google Sheet with new data and formatting
Process:
  4.6.1: Prepare Value Updates
    - For each changed field:
      - Calculate column letter (I, J, K, L, M, N)
      - Prepare value update
    - Add extractionStatus
    - Add errorMessage (if exists)
    - Add lastChecked timestamp
  
  4.6.2: Prepare Format Updates
    - For each changed field:
      - Get format from ComparisonService
      - Prepare format request:
        - Text color (RGB)
        - Bold flag
        - Cell range
  
  4.6.3: Execute Batch Updates
    - Batch update values (batchUpdate API)
    - Batch update formats (batchUpdate API)

Result: Row updated in sheet
```

#### 4.7: Save Snapshot to Firebase
```
Action: Save extracted data to Firebase
Collection: programSnapshots
Document ID: programId
Process:
  - Create/update document
  - Set lastSnapshot to extractedData
  - Update lastUpdated timestamp
  - Append to extractionHistory (keep last 50)
  - Store status and errorMessage

Result: Snapshot saved
```

#### 4.8: Update Statistics
```
Action: Update local counters
- If status === SUCCESS: successful++
- Otherwise: failed++
- If error: Add to errors array
```

#### 4.9: Delay
```
Action: Wait before next request
Duration: 1000ms (1 second)
Purpose: Be respectful to APIs and rate limits
```

### Step 5: Update Execution Log (Final)
```
Action: Update execution log with final statistics
Fields:
  - endTime: Current timestamp
  - successful: Count of successful extractions
  - failed: Count of failed extractions
  - errors: Array of error details
```

### Step 6: Print Summary
```
Action: Display execution summary
Output:
  === Execution Summary ===
  Total programs: {count}
  Successful: {count}
  Failed: {count}
  Duration: {seconds}s
  ========================
```

## Error Handling Flow

### URL Fetch Error
```
1. Retry up to 3 times
2. If still fails:
   - Set status = FETCH_ERROR
   - Set errorMessage = Error message (max 200 chars)
   - Update sheet with error
   - Save snapshot with error
   - Continue to next program
```

### AI Extraction Error
```
1. Catch JSON parse errors
2. Catch API errors
3. Return all NOT_FOUND
4. Set status = NOT_FOUND or FETCH_ERROR
5. Continue workflow
```

### Sheet Update Error
```
1. Log error to execution log
2. Continue processing other programs
3. Don't block entire execution
```

### Firebase Error
```
1. Log error
2. Continue processing (don't block)
3. Sheet updates still proceed
4. Graceful degradation
```

## Rate Limiting Flow

### Check Rate Limit
```
1. Read rateLimits/requests document
2. Check current time vs reset times
3. Reset counters if time window passed
4. Check if under limits
5. If allowed:
   - Increment counters
   - Return { allowed: true }
6. If not allowed:
   - Calculate reset time
   - Return { allowed: false, resetAt: Date }
```

### Wait for Rate Limit
```
1. Calculate wait time (resetAt - now)
2. Sleep for wait time
3. Retry rate limit check
```

## Comparison Logic Details

### Change Detection
```
For each field:
  oldValue = existingRow[field] || lastSnapshot[field] || ''
  newValue = extractedData[field] || ''
  
  if (newValue !== oldValue):
    if (!oldValue && newValue && newValue !== 'NOT_FOUND'):
      changeType = 'NEW'
    else if (newValue === 'NOT_FOUND' && oldValue):
      changeType = 'NOT_FOUND'
    else:
      changeType = 'CHANGED'
    
    Add to changes array
```

### Formatting Rules
```
CHANGED:
  - Color: Blue (RGB: 0.2, 0.4, 1.0)
  - Bold: true

NEW:
  - Color: Green (RGB: 0.0, 0.7, 0.0)
  - Bold: true

NOT_FOUND:
  - Color: Red (RGB: 1.0, 0.0, 0.0)
  - Bold: true
```

## Execution Time Estimates

- **Per Program:**
  - URL fetch: 2-5 seconds
  - AI extraction: 3-8 seconds
  - Sheet update: 1-2 seconds
  - Firebase save: 0.5-1 second
  - Total: ~7-16 seconds per program

- **For 100 Programs:**
  - Estimated: 12-27 minutes
  - With rate limiting: May take longer

- **For 1000 Programs:**
  - Estimated: 2-4.5 hours
  - With rate limiting: May take longer

## Monitoring

- **Real-time:** Console logs for each program
- **Post-execution:** Execution log in Firebase
- **Per-program:** Extraction history in Firebase
- **Sheet:** lastChecked column shows when each program was updated

