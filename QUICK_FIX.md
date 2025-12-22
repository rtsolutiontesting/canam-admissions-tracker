# Quick Fix for Real Sheet Execution

## 🔴 Current Issue

Firestore API is not enabled, causing connection errors.

## ✅ Solution Steps

### Step 1: Enable Firestore API (REQUIRED)

**Option A: Direct Link**
Visit and click "Enable":
```
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=program-info-extractor
```

**Option B: Manual Steps**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `program-info-extractor`
3. Go to **APIs & Services** → **Library**
4. Search for "Cloud Firestore API"
5. Click **Enable**

### Step 2: Enable Firestore Database

1. Go to [Firebase Console - Firestore](https://console.firebase.google.com/project/program-info-extractor/firestore)
2. Click **Create Database**
3. Choose **Test mode** (for development)
4. Select location (choose closest to you)
5. Click **Enable**

### Step 3: Run Backend Server

Open a new terminal and run:

```bash
# Make sure .env file exists with your credentials
npm run server
```

This starts the backend API on `http://localhost:3000`

### Step 4: Test Sync

1. Visit: https://program-info-extractor.web.app
2. Enter your Google Sheet URL in the input field
3. Click **Run Manual Sync**
4. Watch the execution stream

## 📋 Required Setup

### .env File
Create `.env` in project root:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
FIREBASE_PROJECT_ID=program-info-extractor
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### Google Sheet Setup
1. Share your Google Sheet with the service account email
2. Give it **Editor** permissions
3. Copy the full URL (including `/edit`)

## 🚀 How It Works

1. **Frontend** (web app) → Calls API
2. **Backend** (Node.js server) → Processes sync
3. **Google Sheets API** → Reads data
4. **AI (Gemini)** → Extracts information
5. **Firestore** → Stores results
6. **Frontend** → Displays updated data

## ⚠️ Troubleshooting

### "Firestore API not enabled"
- Complete Step 1 above
- Wait 2-3 minutes after enabling
- Refresh the page

### "Connection failed"
- Make sure backend is running (`npm run server`)
- Check `.env` file has correct values
- Verify service account key exists

### "Permission denied"
- Share Google Sheet with service account
- Check Firestore rules allow writes
- Verify authentication is working

### "No data in table"
- Run sync first
- Check execution stream for errors
- Verify sheet has data in correct columns

## 📞 Quick Commands

```bash
# Start backend server
npm run server

# In another terminal, check if it's running
curl http://localhost:3000/health

# Deploy frontend updates
npx firebase deploy --only hosting
```

## ✅ Success Indicators

- ✅ Green dot shows "Google API: Authorized"
- ✅ Execution stream shows progress
- ✅ Data table populates after sync
- ✅ No errors in browser console

---

**After completing these steps, your app will execute real sheet syncs!** 🎉

