# Data Models

## Google Sheets Schema

### Input Columns (Existing)
| Column | Letter | Description |
|--------|--------|-------------|
| Sr | A | Serial number |
| universityName | B | University name |
| country | C | Country |
| location | D | Location |
| programName | E | Program name |
| admissionsPageUrl | F | URL to admissions page |
| admissionsEmail | G | Admissions email |
| notes | H | Notes |

### Output Columns (Added/Updated)
| Column | Letter | Description | Format |
|--------|--------|-------------|--------|
| intakeOffered | I | Intake periods offered | String (e.g., "Fall, Spring, Summer") |
| intakeStatus | J | Application status | "open" / "closed" / "waitlist" / "NOT_FOUND" |
| applicationDeadline | K | Application deadline | ISO date (YYYY-MM-DD) or "NOT_FOUND" |
| CAS deadline | L | CAS deadline (UK) | ISO date or "NOT_FOUND" |
| I-20 deadline | M | I-20 deadline (USA) | ISO date or "NOT_FOUND" |
| admissionAlerts | N | Admission alerts/notes | String (max 500 chars) or "NOT_FOUND" |
| extractionStatus | O | Extraction status | "SUCCESS" / "FETCH_ERROR" / "NOT_FOUND" |
| errorMessage | P | Error message | String (max 200 chars) |
| lastChecked | Q | Last check timestamp | ISO timestamp |

### Formatting Rules
- **Changed values:** Blue text (#3366FF), Bold
- **New values:** Green text (#00B300), Bold
- **NOT_FOUND:** Red text (#FF0000), Bold
- **Unchanged values:** Default formatting (black, normal)

## Firebase Data Models

### Collection: `programSnapshots`

**Document ID:** `{universityName}_{programName}` (sanitized)

```typescript
{
  programId: string,
  lastSnapshot: {
    intakeOffered: string,
    intakeStatus: "open" | "closed" | "waitlist" | "NOT_FOUND",
    applicationDeadline: string,
    casDeadline: string,
    i20Deadline: string,
    admissionAlerts: string
  },
  lastUpdated: Timestamp,
  extractionHistory: Array<{
    timestamp: Timestamp,
    status: "SUCCESS" | "FETCH_ERROR" | "NOT_FOUND",
    data: ExtractedData | null,
    errorMessage?: string
  }>
}
```

**Example:**
```json
{
  "programId": "MIT_Computer_Science",
  "lastSnapshot": {
    "intakeOffered": "Fall, Spring",
    "intakeStatus": "open",
    "applicationDeadline": "2024-12-15",
    "casDeadline": "NOT_FOUND",
    "i20Deadline": "2024-11-01",
    "admissionAlerts": "Early decision deadline: 2024-11-01"
  },
  "lastUpdated": "2024-01-15T10:30:00Z",
  "extractionHistory": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "SUCCESS",
      "data": { /* ... */ }
    }
  ]
}
```

### Collection: `executionLogs`

**Document ID:** `exec_{timestamp}_{random}`

```typescript
{
  executionId: string,
  startTime: Timestamp,
  endTime?: Timestamp,
  totalPrograms: number,
  successful: number,
  failed: number,
  errors: Array<{
    programId: string,
    error: string
  }>
}
```

**Example:**
```json
{
  "executionId": "exec_1705312200000_abc123",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:45:00Z",
  "totalPrograms": 150,
  "successful": 142,
  "failed": 8,
  "errors": [
    {
      "programId": "Harvard_Business",
      "error": "Failed to fetch page: Timeout"
    }
  ]
}
```

### Collection: `rateLimits`

**Document ID:** `requests`

```typescript
{
  minuteCount: number,
  hourCount: number,
  lastMinuteReset: Timestamp,
  lastHourReset: Timestamp
}
```

**Example:**
```json
{
  "minuteCount": 45,
  "hourCount": 850,
  "lastMinuteReset": "2024-01-15T10:29:00Z",
  "lastHourReset": "2024-01-15T09:00:00Z"
}
```

## TypeScript Interfaces

### ProgramRow
```typescript
interface ProgramRow {
  sr: string;
  universityName: string;
  country: string;
  location: string;
  programName: string;
  admissionsPageUrl: string;
  admissionsEmail: string;
  notes: string;
  // Output fields
  intakeOffered?: string;
  intakeStatus?: string;
  applicationDeadline?: string;
  casDeadline?: string;
  i20Deadline?: string;
  admissionAlerts?: string;
  extractionStatus?: string;
  errorMessage?: string;
  lastChecked?: string;
}
```

### ExtractedData
```typescript
interface ExtractedData {
  intakeOffered: string;
  intakeStatus: "open" | "closed" | "waitlist" | "NOT_FOUND";
  applicationDeadline: string;
  casDeadline: string;
  i20Deadline: string;
  admissionAlerts: string;
}
```

### ComparisonResult
```typescript
interface ComparisonResult {
  hasChanges: boolean;
  changes: FieldChange[];
  newData: ExtractedData;
  oldData: ExtractedData | null;
}

interface FieldChange {
  field: keyof ExtractedData;
  oldValue: string;
  newValue: string;
  changeType: "CHANGED" | "NEW" | "NOT_FOUND";
}
```

## Data Validation Rules

1. **Field Length Limits:**
   - All text fields: Max 500 characters
   - Error messages: Max 200 characters

2. **Date Format:**
   - ISO 8601 format: YYYY-MM-DD
   - If not available: "NOT_FOUND"

3. **Status Values:**
   - `intakeStatus`: Must be one of: "open", "closed", "waitlist", "NOT_FOUND"
   - `extractionStatus`: Must be one of: "SUCCESS", "FETCH_ERROR", "NOT_FOUND"

4. **Program ID Generation:**
   - Format: `{universityName}_{programName}`
   - Sanitize: Replace non-alphanumeric with underscore
   - Example: "MIT - Computer Science" → "MIT_Computer_Science"

## Data Flow

1. **Read:** Sheet → ProgramRow[]
2. **Extract:** URL → HTML → AI → ExtractedData
3. **Compare:** ExtractedData + ProgramRow → ComparisonResult
4. **Update:** ComparisonResult → Sheet (with formatting)
5. **Persist:** ExtractedData → Firebase Snapshot

