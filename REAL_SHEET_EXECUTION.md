# Real Sheet Execution Setup

## Issue: Firestore API Not Enabled

The error shows: "Cloud Firestore API has not been used in project program-info-extractor before or it is disabled"

## Quick Fix

### Step 1: Enable Firestore API

Visit this URL and click "Enable":
```
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=program-info-extractor
```

Or:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=program-info-extractor)
2. Click **Enable**

### Step 2: Enable Firestore Database

1. Go to [Firebase Console - Firestore](https://console.firebase.google.com/project/program-info-extractor/firestore)
2. Click **Create Database**
3. Choose **Test mode** (for development) or **Production mode**
4. Select location → **Enable**

### Step 3: Deploy Functions (Optional - for Cloud execution)

```bash
# Install dependencies
cd functions
npm install
cd ..

# Deploy
firebase deploy --only functions
```

## Alternative: Use Local Backend

If Cloud Functions don't work, use the local backend:

### Step 1: Set up .env file

Create `.env` in project root:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
FIREBASE_PROJECT_ID=program-info-extractor
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json
GOOGLE_AI_API_KEY=your_ai_key_here
```

### Step 2: Run Backend Locally

```bash
npm run build
npm start
```

### Step 3: Update Frontend to Use Local API

Update `public/index.html` sync function to call:
```javascript
const response = await fetch('http://localhost:3000/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetUrl })
});
```

## Current Status

- ✅ UI matches screenshot
- ✅ Frontend ready for sync
- ⚠️ Firestore API needs enabling
- ⚠️ Backend needs connection

## Next Steps

1. **Enable Firestore API** (see Step 1 above)
2. **Enable Firestore Database** (see Step 2 above)
3. **Deploy Functions** OR **Run Local Backend**
4. **Test Sync** with real Google Sheet URL

