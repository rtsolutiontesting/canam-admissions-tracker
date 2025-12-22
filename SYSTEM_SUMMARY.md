# System Summary

## Overview

This is a production-ready system for tracking and comparing university admissions data. It fetches information from program URLs, extracts structured data using AI, compares it with existing Google Sheets data, and updates the same sheet with visual highlighting.

## Key Features

✅ **Single Sheet Updates** - Updates the same input sheet (no new sheets created)  
✅ **Visual Highlighting** - Color-coded changes (Blue=Changed, Green=New, Red=Not Found)  
✅ **AI-Powered Extraction** - Uses Google Gemini to extract structured data from HTML  
✅ **State Management** - Firebase stores snapshots and execution history  
✅ **Error Resilience** - Continues processing even if individual programs fail  
✅ **Rate Limiting** - Built-in rate limit management  
✅ **Comprehensive Logging** - Execution logs and per-program history  

## Architecture Components

### 1. Main Orchestrator (`src/index.ts`)
- Coordinates all services
- Manages execution flow
- Handles error recovery
- Tracks statistics

### 2. Sheets Service (`src/services/sheets.service.ts`)
- Reads program rows from Google Sheet
- Updates cells with new values
- Applies formatting (colors, bold)
- Ensures required columns exist

### 3. Firebase Service (`src/services/firebase.service.ts`)
- Stores program snapshots
- Tracks extraction history
- Manages execution logs
- Enforces rate limiting

### 4. Extraction Service (`src/services/extraction.service.ts`)
- Fetches URLs with retries
- Handles errors gracefully
- Coordinates with AI service
- Searches official sources if needed

### 5. AI Service (`src/services/ai.service.ts`)
- Sends HTML to Gemini API
- Parses structured JSON response
- Validates and sanitizes data
- Handles AI API errors

### 6. Comparison Service (`src/services/comparison.service.ts`)
- Compares old vs new data
- Classifies change types
- Determines formatting rules

## Data Flow

```
1. Read Google Sheet → ProgramRow[]
2. For each program:
   a. Get last snapshot from Firebase
   b. Fetch URL → HTML
   c. Extract data via AI → ExtractedData
   d. Compare with existing → ComparisonResult
   e. Update sheet with formatting
   f. Save snapshot to Firebase
3. Update execution log
```

## Change Detection Logic

### Change Types:
- **CHANGED**: Existing value → New value (Blue + Bold)
- **NEW**: Empty → New value (Green + Bold)
- **NOT_FOUND**: Existing value → NOT_FOUND (Red + Bold)

### Comparison Priority:
1. Compare with existing sheet cell value (primary)
2. Fallback to last Firebase snapshot
3. If both empty, treat as NEW

## Extracted Fields

For each program, the system extracts:
- `intakeOffered`: Intake periods (e.g., "Fall, Spring")
- `intakeStatus`: open / closed / waitlist / NOT_FOUND
- `applicationDeadline`: ISO date format
- `casDeadline`: CAS deadline (UK programs)
- `i20Deadline`: I-20 deadline (USA programs)
- `admissionAlerts`: Important alerts/notes

## Error Handling

### URL Fetch Failures:
- Retry up to 3 times
- Mark as FETCH_ERROR
- Write error message (max 200 chars)
- Continue processing

### AI Extraction Failures:
- Return all NOT_FOUND
- Log error to Firebase
- Continue workflow

### Sheet Update Failures:
- Log error to execution log
- Continue processing other rows
- Don't block entire execution

## Rate Limiting

- **Per-minute**: 60 requests
- **Per-hour**: 1000 requests
- **Implementation**: Firebase-based counter
- **Behavior**: Wait until reset if limit reached

## Configuration

All configuration is in `src/config/index.ts`:
- Google Sheets credentials
- Firebase project settings
- AI API key
- Extraction settings (retries, timeouts)
- Rate limiting thresholds

## Execution Time

- **Per program**: ~7-16 seconds
- **100 programs**: ~12-27 minutes
- **1000 programs**: ~2-4.5 hours

## Output Formatting

### Google Sheets:
- Changed values: **Blue text, Bold**
- New values: **Green text, Bold**
- NOT_FOUND: **Red text, Bold**
- Unchanged: Default formatting

### Firebase:
- `programSnapshots`: Last known state per program
- `executionLogs`: Run history and statistics
- `rateLimits`: Request rate tracking

## Files Structure

```
.
├── src/
│   ├── index.ts                 # Main orchestrator
│   ├── config/
│   │   └── index.ts             # Configuration
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── services/
│       ├── sheets.service.ts    # Google Sheets API
│       ├── firebase.service.ts  # Firebase/Firestore
│       ├── extraction.service.ts # URL fetching
│       ├── ai.service.ts        # Gemini AI
│       └── comparison.service.ts # Change detection
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── ARCHITECTURE.md              # Detailed architecture
├── DATA_MODEL.md                # Data structures
├── AI_PROMPT.md                 # AI prompt details
├── RUN_FLOW.md                  # Execution flow
└── SETUP.md                     # Setup guide
```

## Usage

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your credentials

# Build
npm run build

# Run
npm start
```

## Production Considerations

1. **Scalability**: Process programs sequentially with delays
2. **Reliability**: Error isolation prevents cascade failures
3. **Monitoring**: Comprehensive logging in Firebase
4. **Security**: Service account authentication, no hardcoded keys
5. **Maintainability**: Clean separation of concerns, TypeScript types

## Limitations

1. **Fixed Column Order**: Assumes columns are in specific order
2. **Single Sheet**: Only processes one sheet at a time
3. **Sequential Processing**: Programs processed one at a time
4. **AI Dependency**: Requires valid AI API key and quota
5. **URL Accessibility**: URLs must be publicly accessible

## Future Enhancements

- Parallel processing for multiple programs
- Support for multiple sheets
- Enhanced official source search
- Webhook notifications for changes
- Dashboard for monitoring
- Scheduled automatic runs

## Support

For detailed information, see:
- `SETUP.md` - Setup instructions
- `ARCHITECTURE.md` - System architecture
- `DATA_MODEL.md` - Data structures
- `RUN_FLOW.md` - Execution flow
- `AI_PROMPT.md` - AI extraction details

