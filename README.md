# University Admissions Data Tracker

Production-ready system for tracking and comparing university admissions data from program URLs with Google Sheets.

## Architecture

### System Flow
```
Google Sheet (Input) 
    ↓
Firebase (State Storage)
    ↓
URL Extraction Service
    ↓
AI Extraction (Gemini)
    ↓
Comparison Engine
    ↓
Google Sheet (Updated with Highlights)
```

### Components
1. **Orchestrator** (`src/index.ts`): Main entry point, coordinates all services
2. **Sheets Service** (`src/services/sheets.service.ts`): Google Sheets API integration
3. **Firebase Service** (`src/services/firebase.service.ts`): Firestore state management
4. **AI Service** (`src/services/ai.service.ts`): Google AI Studio (Gemini) integration
5. **Extraction Service** (`src/services/extraction.service.ts`): URL fetching and data extraction
6. **Comparison Engine** (`src/services/comparison.service.ts`): Change detection and formatting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (`.env`):
```
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json
GOOGLE_AI_API_KEY=your_ai_api_key
```

3. Build:
```bash
npm run build
```

4. Run:
```bash
npm start
```

## Google Sheets Schema

### Input Columns (Existing)
- `Sr`: Serial number
- `universityName`: University name
- `country`: Country
- `location`: Location
- `programName`: Program name
- `admissionsPageUrl`: URL to admissions page
- `admissionsEmail`: Admissions email
- `notes`: Notes

### Output Columns (Added/Updated)
- `intakeOffered`: Intake periods offered
- `intakeStatus`: open / closed / waitlist
- `applicationDeadline`: Application deadline
- `CAS deadline`: CAS deadline (UK)
- `I-20 deadline`: I-20 deadline (USA)
- `admissionAlerts`: Admission alerts/notes
- `extractionStatus`: FETCH_ERROR / SUCCESS / NOT_FOUND
- `errorMessage`: Error message (max 200 chars)
- `lastChecked`: ISO timestamp

## Firebase Data Model

### Collection: `programSnapshots`
```typescript
{
  programId: string, // Composite: universityName_programName
  lastSnapshot: {
    intakeOffered: string,
    intakeStatus: string,
    applicationDeadline: string,
    casDeadline: string,
    i20Deadline: string,
    admissionAlerts: string
  },
  lastUpdated: Timestamp,
  extractionHistory: Array<{
    timestamp: Timestamp,
    status: string,
    data: object
  }>
}
```

### Collection: `executionLogs`
```typescript
{
  executionId: string,
  startTime: Timestamp,
  endTime: Timestamp,
  totalPrograms: number,
  successful: number,
  failed: number,
  errors: Array<{programId: string, error: string}>
}
```

## AI Prompt

The AI prompt is defined in `src/services/ai.service.ts` and extracts structured JSON data from admissions pages.

## Error Handling

- Failed URL fetches don't stop the workflow
- Errors are logged to Firebase and written to the sheet
- Rate limiting is handled via Firebase state
- Retry logic for transient failures

