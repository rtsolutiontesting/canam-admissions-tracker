# System Architecture

## Overview

The University Admissions Tracker is a production-ready system that monitors and updates university admissions data by comparing information extracted from program URLs with existing Google Sheets data.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets (Input/Output)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Program Data:                                        │   │
│  │  - universityName, programName, admissionsPageUrl    │   │
│  │  - intakeOffered, intakeStatus, deadlines, etc.      │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Read rows
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Main Orchestrator                        │
│                    (src/index.ts)                           │
│  - Coordinates all services                                 │
│  - Manages execution flow                                    │
│  - Handles error recovery                                   │
└───────┬─────────────────────────────────────────────────────┘
        │
        ├─────────────────┬──────────────────┬─────────────────┐
        │                 │                  │                 │
        ▼                 ▼                  ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Sheets       │  │ Firebase     │  │ Extraction   │  │ Comparison   │
│ Service      │  │ Service      │  │ Service      │  │ Service      │
│              │  │              │  │              │  │              │
│ - Read rows  │  │ - Snapshots  │  │ - Fetch URLs │  │ - Detect     │
│ - Update     │  │ - Logs       │  │ - Extract    │  │   changes    │
│ - Format     │  │ - Rate limit │  │   data       │  │ - Determine  │
│              │  │              │  │              │  │   formatting │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │                 │
       │                 │                  │                 │
       └─────────────────┴──────────────────┴─────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   AI Service     │
              │  (Gemini API)    │
              │                  │
              │ - Parse HTML     │
              │ - Extract data   │
              │ - Return JSON    │
              └──────────────────┘
```

## Data Flow

### 1. Initialization
- Load configuration from environment variables
- Initialize Google Sheets API client
- Initialize Firebase Admin SDK
- Initialize AI service (Gemini)

### 2. Read Phase
- Read all program rows from Google Sheet
- For each row, fetch last snapshot from Firebase (if exists)

### 3. Extraction Phase
- For each program:
  - Check rate limits (Firebase)
  - Fetch admissions page URL
  - Extract HTML content
  - Send to AI service for structured extraction
  - If data not found, attempt official source search
  - Return structured data or NOT_FOUND

### 4. Comparison Phase
- Compare extracted data with:
  1. Existing sheet cell values (primary)
  2. Last Firebase snapshot (fallback)
- Identify changes:
  - Changed values (existing → new)
  - New values (empty → new)
  - Not found (existing → NOT_FOUND)

### 5. Update Phase
- Update Google Sheet:
  - Write new values to cells
  - Apply formatting (colors, bold):
    - Blue + Bold: Changed values
    - Green + Bold: New values
    - Red + Bold: NOT_FOUND
  - Update metadata (extractionStatus, errorMessage, lastChecked)

### 6. Persistence Phase
- Save snapshot to Firebase:
  - Store extracted data
  - Store extraction history
  - Update timestamps

### 7. Logging Phase
- Update execution log in Firebase
- Record statistics (successful, failed, errors)

## Component Details

### Sheets Service
- **Responsibilities:**
  - Read program rows
  - Update cells with new values
  - Apply formatting via batchUpdate API
  - Ensure required columns exist

- **Key Methods:**
  - `readProgramRows()`: Read all programs
  - `updateRow()`: Update single row with data + formatting
  - `ensureColumnsExist()`: Add missing columns

### Firebase Service
- **Responsibilities:**
  - Store program snapshots
  - Track extraction history
  - Manage execution logs
  - Enforce rate limiting

- **Collections:**
  - `programSnapshots`: Last known state per program
  - `executionLogs`: Run history and statistics
  - `rateLimits`: Request rate tracking

### Extraction Service
- **Responsibilities:**
  - Fetch URLs with retries
  - Handle errors gracefully
  - Coordinate with AI service
  - Search official sources if needed

- **Error Handling:**
  - Retry failed requests (3 attempts)
  - Return NOT_FOUND on persistent failures
  - Log errors to Firebase

### AI Service
- **Responsibilities:**
  - Send HTML to Gemini API
  - Parse structured JSON response
  - Validate and sanitize extracted data
  - Handle AI API errors

- **Prompt Strategy:**
  - Clean HTML before sending
  - Provide context (university, program, URL)
  - Request strict JSON output
  - Enforce field length limits

### Comparison Service
- **Responsibilities:**
  - Compare old vs new data
  - Classify change types
  - Determine formatting rules

- **Change Types:**
  - `CHANGED`: Existing value → New value
  - `NEW`: Empty → New value
  - `NOT_FOUND`: Existing value → NOT_FOUND

## Error Handling Strategy

1. **URL Fetch Failures:**
   - Retry up to 3 times
   - If still fails, mark as FETCH_ERROR
   - Write error message to sheet (max 200 chars)
   - Continue processing other programs

2. **AI Extraction Failures:**
   - Return NOT_FOUND for all fields
   - Log error to Firebase
   - Continue workflow

3. **Sheet Update Failures:**
   - Log error to execution log
   - Continue processing other rows
   - Don't block entire execution

4. **Firebase Failures:**
   - Log error but continue
   - Don't block sheet updates
   - Graceful degradation

## Rate Limiting

- **Per-minute limit:** 60 requests
- **Per-hour limit:** 1000 requests
- **Implementation:** Firebase-based counter
- **Behavior:** Wait until reset if limit reached

## Scalability Considerations

- **Batch Processing:** Process programs sequentially with delays
- **State Management:** Firebase snapshots prevent duplicate work
- **Error Isolation:** One program failure doesn't stop others
- **Logging:** Comprehensive logs for debugging and monitoring

## Security

- **Authentication:** Google Service Account (read-only for sheets)
- **API Keys:** Stored in environment variables
- **No HTML Storage:** Only extracted structured data stored
- **Rate Limiting:** Prevents API abuse

## Monitoring

- **Execution Logs:** Firebase stores run statistics
- **Extraction History:** Per-program change tracking
- **Error Tracking:** Detailed error logs per program
- **Timestamps:** lastChecked column tracks when data was updated

