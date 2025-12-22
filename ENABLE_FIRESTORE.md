# Enable Firestore for program-info-extractor

## Current Status
✅ Firebase project is set: **program-info-extractor**  
❌ Firestore API needs to be enabled

## Step 1: Enable Firestore API

You have two options:

### Option A: Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/program-info-extractor)
2. Click **Firestore Database** in the left menu
3. Click **Create Database**
4. Choose **Production mode** (or **Test mode** for development)
5. Select a location (choose closest to your users)
6. Click **Enable**

This will automatically enable the Firestore API.

### Option B: Via Google Cloud Console

1. Go to [Google Cloud Console - Firestore API](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=program-info-extractor)
2. Click **Enable**
3. Wait a few minutes for the API to propagate

## Step 2: After Enabling

Once Firestore is enabled, deploy the rules and indexes:

```bash
npx firebase deploy --only firestore
```

## Step 3: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/program-info-extractor/settings/serviceaccounts/adminsdk)
2. Click **Generate New Private Key**
3. Save as `firebase-service-account-key.json` in project root

## Step 4: Create .env File

Create a `.env` file in the project root:

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

## Step 5: Test Connection

```bash
npm run build
npm start
```

You should see: `Firebase initialized successfully`

## Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/program-info-extractor
- **Firestore Database:** https://console.firebase.google.com/project/program-info-extractor/firestore
- **Service Accounts:** https://console.firebase.google.com/project/program-info-extractor/settings/serviceaccounts/adminsdk
- **Enable Firestore API:** https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=program-info-extractor

