# Deploy Web Dashboard & Seed Mock Data

## Step 1: Seed Mock Data to Firestore

```bash
# Build first (if not already built)
npm run build

# Seed mock data
npm run seed
```

This will create:
- 6 mock program snapshots (MIT, Harvard, Oxford, Stanford, Cambridge, UC Berkeley)
- 2 mock execution logs
- Rate limits initialization

## Step 2: Deploy Web Dashboard

```bash
# Deploy hosting
npm run firebase:deploy:hosting

# Or deploy everything (Firestore + Hosting)
npm run firebase:deploy:all
```

## Step 3: Access Your Live Dashboard

After deployment, you'll get a URL like:
```
https://program-info-extractor.web.app
```
or
```
https://program-info-extractor.firebaseapp.com
```

## Viewing Data

### Option 1: Web Dashboard (Recommended)
- Visit the deployed URL above
- Real-time data from Firestore
- Auto-refreshes every 30 seconds

### Option 2: Firebase Console
- Go to: https://console.firebase.google.com/project/program-info-extractor/firestore
- View collections: `programSnapshots`, `executionLogs`, `rateLimits`

## Mock Data Details

### Programs Created:
1. **MIT - Computer Science** (USA) - Status: Open
2. **Harvard - MBA** (USA) - Status: Open
3. **Oxford - Computer Science** (UK) - Status: Open
4. **Stanford - Data Science** (USA) - Status: Open
5. **Cambridge - Engineering** (UK) - Status: Closed
6. **UC Berkeley - AI** (USA) - Status: Waitlist

### Execution Logs:
- 2 sample execution logs with success/failure statistics

## Troubleshooting

### If seed script fails:
- Make sure Firestore is enabled
- Check service account key is in place
- Verify `.env` has correct `FIREBASE_PROJECT_ID`

### If hosting deploy fails:
- Enable Firebase Hosting in Firebase Console
- Run: `firebase init hosting` (select existing `public` folder)

### If dashboard shows no data:
- Run the seed script: `npm run seed`
- Check browser console for errors
- Verify Firestore security rules allow read access

## Security Note

The current Firestore rules allow public read access for the dashboard. For production, you should:
1. Add Firebase Authentication
2. Update `firestore.rules` to require authentication
3. Add login to the web dashboard

