# Firebase Project Setup: program-info-extractor

Your app is now configured to use the Firebase project: **program-info-extractor**

## Project Details

- **Project ID:** `program-info-extractor`
- **Auth Domain:** `program-info-extractor.firebaseapp.com`
- **Storage Bucket:** `program-info-extractor.firebasestorage.app`

## Next Steps

### 1. Set Active Firebase Project

```bash
npx firebase use program-info-extractor
```

Or it's already set in `.firebaserc`.

### 2. Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/program-info-extractor)
2. Click the gear icon → **Project Settings**
3. Go to **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the JSON file as `firebase-service-account-key.json` in the project root

### 3. Create/Update .env File

Create a `.env` file in the project root with:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json

# Firebase Configuration
FIREBASE_PROJECT_ID=program-info-extractor
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json

# Google AI Studio (Gemini) Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 4. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/program-info-extractor)
2. Click **Firestore Database** in the left menu
3. Click **Create Database**
4. Choose **Production mode** (or Test mode for development)
5. Select a location (choose closest to your users)
6. Click **Enable**

### 5. Deploy Firestore Rules and Indexes

```bash
npx firebase deploy --only firestore
```

This will deploy:
- Security rules from `firestore.rules`
- Indexes from `firestore.indexes.json`

### 6. Verify Connection

```bash
# Build the project
npm run build

# Run the tracker (will test Firebase connection)
npm start
```

You should see: `Firebase initialized successfully`

### 7. Verify Collections Created

After running the tracker, check Firebase Console:
- Go to **Firestore Database**
- You should see collections:
  - `programSnapshots`
  - `executionLogs`
  - `rateLimits`

## Quick Commands

```bash
# Set project (already done in .firebaserc)
npx firebase use program-info-extractor

# Deploy Firestore rules and indexes
npx firebase deploy --only firestore

# View Firestore data
# Go to: https://console.firebase.google.com/project/program-info-extractor/firestore
```

## Project Configuration Files

- `.firebaserc` - ✅ Updated with project ID
- `firebase.json` - ✅ Configured for Firestore
- `firestore.rules` - ✅ Security rules ready
- `firestore.indexes.json` - ✅ Indexes ready

## Troubleshooting

### If you get "Project not found"
- Make sure you're logged in: `npx firebase login`
- Verify project exists: `npx firebase projects:list`
- Check you have access to the project

### If Firestore is not enabled
- Go to Firebase Console
- Enable Firestore Database (see step 4 above)

### If service account key doesn't work
- Regenerate the key from Firebase Console
- Make sure the file is named exactly: `firebase-service-account-key.json`
- Check the file path in `.env` matches

Your app is now ready to use Firebase project: **program-info-extractor**!

