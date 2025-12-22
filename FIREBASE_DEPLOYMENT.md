# Firebase Deployment Guide

This guide will help you connect and deploy the system to Firebase Firestore using the CLI.

## Prerequisites

1. **Node.js** installed (v18+)
2. **Firebase account** - Sign up at [firebase.google.com](https://firebase.google.com)
3. **Google Cloud Project** (Firebase uses GCP)

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Or use the local version (already in devDependencies):
```bash
npm install
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication. Complete the login process.

## Step 3: Initialize Firebase Project

### Option A: New Firebase Project

1. **Create a new Firebase project:**
   ```bash
   firebase projects:create your-project-id
   ```

2. **Initialize Firebase in your project:**
   ```bash
   npm run firebase:init
   ```
   
   Or manually:
   ```bash
   firebase init
   ```

3. **Select the following:**
   - ✅ Firestore
   - ❌ Functions (optional, for Cloud Functions deployment)
   - ❌ Hosting (not needed)
   - ❌ Storage (not needed)
   - ❌ Emulators (optional for local testing)

4. **When prompted:**
   - Select your Firebase project (or create new)
   - Use default Firestore rules file: `firestore.rules`
   - Use default Firestore indexes file: `firestore.indexes.json`
   - Don't overwrite existing files (if any)

### Option B: Use Existing Firebase Project

1. **List your projects:**
   ```bash
   npm run firebase:projects:list
   ```

2. **Set the active project:**
   ```bash
   firebase use your-existing-project-id
   ```

3. **Or edit `.firebaserc` manually:**
   ```json
   {
     "projects": {
       "default": "your-existing-project-id"
     }
   }
   ```

## Step 4: Create Firestore Database

1. **Go to Firebase Console:**
   - Visit [Firebase Console](https://console.firebase.google.com)
   - Select your project

2. **Create Firestore Database:**
   - Go to **Firestore Database**
   - Click **Create Database**
   - Choose **Production mode** (or Test mode for development)
   - Select a location (choose closest to your users)
   - Click **Enable**

## Step 5: Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
npm run firebase:deploy:rules

# Deploy indexes
npm run firebase:deploy:indexes

# Or deploy both at once
firebase deploy --only firestore
```

## Step 6: Get Firebase Service Account Key

1. **Go to Firebase Console:**
   - Project Settings → **Service Accounts** tab

2. **Generate Private Key:**
   - Click **Generate New Private Key**
   - Save the JSON file as `firebase-service-account-key.json` in project root

3. **Update `.env`:**
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json
   ```

## Step 7: Verify Connection

Test the connection:

```bash
# Build the project
npm run build

# Run the tracker (it will test Firebase connection)
npm start
```

You should see: `Firebase initialized successfully`

## Step 8: Verify Firestore Collections

After running the tracker, check Firebase Console:

1. Go to **Firestore Database**
2. You should see these collections:
   - `programSnapshots` - Stores program data snapshots
   - `executionLogs` - Stores execution history
   - `rateLimits` - Stores rate limiting state

## Firestore Security Rules

The `firestore.rules` file defines access rules:

- **programSnapshots**: Full access (service account only)
- **executionLogs**: Full access (service account only)
- **rateLimits**: Full access (service account only)

**Note:** In production, you may want to restrict these rules further based on your security requirements.

## Firestore Indexes

The `firestore.indexes.json` file defines composite indexes for efficient queries:

- `programSnapshots` by `lastUpdated` (descending)
- `executionLogs` by `startTime` (descending)

These are automatically created when you deploy.

## Common Commands

```bash
# Login to Firebase
npm run firebase:login

# List projects
npm run firebase:projects:list

# Switch project
firebase use project-id

# Deploy rules only
npm run firebase:deploy:rules

# Deploy indexes only
npm run firebase:deploy:indexes

# Deploy everything
firebase deploy

# View Firestore data
firebase firestore:indexes
```

## Troubleshooting

### Error: "Firebase project not found"
- Make sure you're logged in: `firebase login`
- Check your project ID in `.firebaserc`
- Verify project exists: `firebase projects:list`

### Error: "Permission denied"
- Ensure service account has Firestore permissions
- Check Firebase Console → IAM & Admin → Service Accounts
- Regenerate service account key if needed

### Error: "Rules deployment failed"
- Check `firestore.rules` syntax
- Ensure Firestore is enabled in Firebase Console
- Try: `firebase deploy --only firestore:rules --force`

### Error: "Index deployment failed"
- Check `firestore.indexes.json` syntax
- Some indexes may take time to build
- Check Firebase Console → Firestore → Indexes for status

### Connection Issues
- Verify `FIREBASE_PROJECT_ID` in `.env` matches `.firebaserc`
- Check service account key path is correct
- Ensure service account key has proper permissions

## Production Deployment

### Option 1: Local Machine
- Run `npm start` on a scheduled basis (cron job, task scheduler)
- Ensure machine has internet access
- Keep service account keys secure

### Option 2: Cloud Functions (Recommended)
1. Initialize Functions:
   ```bash
   firebase init functions
   ```

2. Move code to `functions/` directory
3. Deploy:
   ```bash
   firebase deploy --only functions
   ```

4. Schedule with Cloud Scheduler:
   ```bash
   gcloud scheduler jobs create http admissions-tracker \
     --schedule="0 9 * * *" \
     --uri="https://your-region-your-project.cloudfunctions.net/admissionsTracker" \
     --http-method=POST
   ```

### Option 3: Cloud Run
- Containerize the application
- Deploy to Cloud Run
- Set up Cloud Scheduler trigger

## Monitoring

1. **Firebase Console:**
   - Firestore → Usage tab (monitor reads/writes)
   - Firestore → Data tab (view collections)

2. **Execution Logs:**
   - Check `executionLogs` collection in Firestore
   - Each execution has: startTime, endTime, success/failure counts

3. **Program Snapshots:**
   - Check `programSnapshots` collection
   - View extraction history per program

## Next Steps

1. ✅ Deploy Firestore rules and indexes
2. ✅ Test connection with `npm start`
3. ✅ Verify collections are created
4. ✅ Set up scheduled execution (optional)
5. ✅ Monitor usage in Firebase Console

Your system is now connected to Firebase Firestore!

