# Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Cloud Project** with:
   - Google Sheets API enabled
   - Google AI Studio API access
3. **Firebase Project** (Firestore enabled)
4. **Google Service Account** credentials
5. **Google AI Studio API Key**

## Step 1: Clone and Install

```bash
# Install dependencies
npm install
```

## Step 2: Google Cloud Setup

### 2.1 Create Service Account for Google Sheets

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Google Sheets API** and **Google Drive API**
4. Go to **IAM & Admin** > **Service Accounts**
5. Create a new service account
6. Download the JSON key file
7. Save it as `service-account-key.json` in the project root

### 2.2 Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from the JSON file, field: `client_email`)
4. Give it **Editor** permissions
5. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```

### 2.3 Get Google AI Studio API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

## Step 3: Firebase Setup

### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database**
4. Create the database in **Production mode** (or Test mode for development)

### 3.2 Get Firebase Service Account

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Save it as `firebase-service-account-key.json` in the project root

## Step 4: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

## Step 5: Prepare Google Sheet

Your Google Sheet should have the following structure:

### Required Input Columns (A-H):
- **A**: Sr (Serial number)
- **B**: universityName
- **C**: country
- **D**: location
- **E**: programName
- **F**: admissionsPageUrl
- **G**: admissionsEmail
- **H**: notes

### Output Columns (I-Q) - Will be added automatically:
- **I**: intakeOffered
- **J**: intakeStatus
- **K**: applicationDeadline
- **L**: CAS deadline
- **M**: I-20 deadline
- **N**: admissionAlerts
- **O**: extractionStatus
- **P**: errorMessage
- **Q**: lastChecked

**Note:** The system will automatically add missing output columns on first run.

## Step 6: Build and Run

```bash
# Build TypeScript
npm run build

# Run the tracker
npm start
```

Or for development:
```bash
npm run dev
```

## Step 7: Verify

1. Check the console output for execution summary
2. Check your Google Sheet - columns should be updated with colors:
   - **Blue + Bold**: Changed values
   - **Green + Bold**: New values
   - **Red + Bold**: NOT_FOUND
3. Check Firebase Console:
   - `programSnapshots` collection should have documents
   - `executionLogs` collection should have execution records

## Troubleshooting

### Error: "Failed to initialize Google Sheets"
- Verify service account JSON file path is correct
- Ensure Google Sheets API is enabled
- Check that service account email has access to the sheet

### Error: "GOOGLE_AI_API_KEY is required"
- Verify API key is set in `.env`
- Check API key is valid in Google AI Studio

### Error: "Firebase initialization failed"
- Verify Firebase service account JSON path
- Ensure Firestore is enabled in Firebase project
- Check project ID matches

### Rate Limiting
- The system automatically handles rate limits
- If you hit limits, wait and re-run
- Adjust `requestsPerMinute` and `requestsPerHour` in `src/config/index.ts` if needed

### No Data Extracted
- Check that URLs are valid and accessible
- Verify AI API key has sufficient quota
- Check console logs for specific error messages

## Production Deployment

### Option 1: Firebase Cloud Functions

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase Functions:
   ```bash
   firebase init functions
   ```

3. Move code to `functions/` directory
4. Deploy:
   ```bash
   firebase deploy --only functions
   ```

### Option 2: Cloud Run / App Engine

1. Create `Dockerfile` or `app.yaml`
2. Deploy to Google Cloud Run or App Engine
3. Set environment variables in cloud console

### Option 3: Scheduled Execution

Use Cloud Scheduler to trigger the function:
```bash
gcloud scheduler jobs create http admissions-tracker \
  --schedule="0 9 * * *" \
  --uri="https://your-function-url" \
  --http-method=POST
```

## Security Best Practices

1. **Never commit credentials:**
   - Add `*.json` to `.gitignore`
   - Use environment variables in production

2. **Service Account Permissions:**
   - Use least privilege principle
   - Only grant necessary permissions

3. **API Key Security:**
   - Rotate API keys regularly
   - Use separate keys for dev/prod

4. **Firebase Rules:**
   - Set up Firestore security rules
   - Restrict access to service account only

## Monitoring

- **Execution Logs:** Check Firebase `executionLogs` collection
- **Program History:** Check `programSnapshots` collection
- **Sheet Updates:** Check `lastChecked` column in sheet
- **Error Tracking:** Check `errorMessage` column in sheet

## Support

For issues or questions:
1. Check console logs
2. Review Firebase execution logs
3. Verify all credentials are correct
4. Check API quotas and limits

