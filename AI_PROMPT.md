# AI Extraction Prompt

## Prompt Template

The following prompt is used with Google AI Studio (Gemini) to extract structured data from admissions pages.

```
You are a data extraction assistant. Extract university admissions information from the following content.

CONTEXT:
- University: {universityName}
- Program: {programName}
- Source URL: {url}

HTML CONTENT (cleaned):
{htmlContent}

TASK:
Extract the following information and return ONLY valid JSON (no markdown, no explanations, no HTML):

{
  "intakeOffered": "string (e.g., 'Fall, Spring, Summer' or 'NOT_FOUND')",
  "intakeStatus": "string (one of: 'open', 'closed', 'waitlist', 'NOT_FOUND')",
  "applicationDeadline": "ISO date format or 'NOT_FOUND'",
  "casDeadline": "ISO date format or 'NOT_FOUND' - UK programs only",
  "i20Deadline": "ISO date format or 'NOT_FOUND' - USA programs only",
  "admissionAlerts": "string (any important alerts or notes, or 'NOT_FOUND')"
}

RULES:
1. Return ONLY the JSON object, nothing else
2. If information is not found, use "NOT_FOUND" as the value
3. Dates should be in ISO format (YYYY-MM-DD) if available
4. Keep all text values under 500 characters
5. For intakeStatus, use lowercase: 'open', 'closed', 'waitlist', or 'NOT_FOUND'
6. Do not include any markdown formatting, explanations, or HTML tags in the output
7. If the content is unclear or insufficient, return "NOT_FOUND" for all fields

OUTPUT (JSON only):
```

## Implementation Details

### Pre-processing
1. **HTML Cleaning:**
   - Remove `<script>` tags and content
   - Remove `<style>` tags and content
   - Strip HTML tags (keep text content)
   - Normalize whitespace
   - Limit to 50,000 characters

2. **Context Injection:**
   - University name
   - Program name
   - Source URL

### Post-processing
1. **JSON Parsing:**
   - Extract JSON from response (handles markdown code blocks)
   - Validate JSON structure

2. **Data Sanitization:**
   - Truncate fields to 500 characters
   - Validate `intakeStatus` values
   - Normalize date formats
   - Replace empty/null with "NOT_FOUND"

3. **Error Handling:**
   - If JSON parsing fails → Return all "NOT_FOUND"
   - If AI API error → Return all "NOT_FOUND"
   - Log errors for debugging

## Expected Output Format

### Success Case
```json
{
  "intakeOffered": "Fall, Spring, Summer",
  "intakeStatus": "open",
  "applicationDeadline": "2024-12-15",
  "casDeadline": "NOT_FOUND",
  "i20Deadline": "2024-11-01",
  "admissionAlerts": "Early decision deadline: 2024-11-01"
}
```

### Not Found Case
```json
{
  "intakeOffered": "NOT_FOUND",
  "intakeStatus": "NOT_FOUND",
  "applicationDeadline": "NOT_FOUND",
  "casDeadline": "NOT_FOUND",
  "i20Deadline": "NOT_FOUND",
  "admissionAlerts": "NOT_FOUND"
}
```

## Field Extraction Guidelines

### intakeOffered
- Look for: "Intake", "Admission periods", "Application cycles"
- Examples: "Fall, Spring", "Fall only", "Rolling admissions"
- If not found: "NOT_FOUND"

### intakeStatus
- Look for: "Open", "Closed", "Waitlist", "Accepting applications"
- Must be lowercase: "open", "closed", "waitlist"
- If unclear: "NOT_FOUND"

### applicationDeadline
- Look for: "Deadline", "Application due", "Submit by"
- Format: YYYY-MM-DD
- If multiple deadlines, use earliest
- If not found: "NOT_FOUND"

### casDeadline (UK only)
- Look for: "CAS", "Confirmation of Acceptance for Studies"
- Format: YYYY-MM-DD
- If not UK program or not found: "NOT_FOUND"

### i20Deadline (USA only)
- Look for: "I-20", "F-1 visa", "Student visa"
- Format: YYYY-MM-DD
- If not USA program or not found: "NOT_FOUND"

### admissionAlerts
- Look for: Important notices, special requirements, early decision info
- Max 500 characters
- If not found: "NOT_FOUND"

## Error Scenarios

1. **Invalid HTML:**
   - Clean as much as possible
   - Extract text content
   - Proceed with extraction

2. **Unclear Content:**
   - Return "NOT_FOUND" for uncertain fields
   - Prefer accuracy over guessing

3. **Multiple Values:**
   - For dates: Use earliest deadline
   - For status: Use most restrictive (closed > waitlist > open)
   - For alerts: Combine into single string

4. **Language Barriers:**
   - If content is not in English, still attempt extraction
   - Return "NOT_FOUND" if completely unclear

## Model Configuration

- **Model:** `gemini-pro` (or `gemini-pro-vision` if images needed)
- **Temperature:** 0.1 (for consistent output)
- **Max Tokens:** 1000 (sufficient for JSON response)
- **Timeout:** 30 seconds

## Rate Limiting

- **Per-minute:** 60 requests
- **Per-hour:** 1000 requests
- **Implementation:** Firebase-based tracking
- **Behavior:** Wait until reset if limit reached

