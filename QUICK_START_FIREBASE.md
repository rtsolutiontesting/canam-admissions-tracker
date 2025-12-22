# Quick Start: Firebase Setup

## Step-by-Step Commands

Run these commands in order from your project directory:

### 1. Login to Firebase
```bash
npx firebase login
```

### 2. List Your Projects (Optional)
```bash
npx firebase projects:list
```

### 3. Initialize Firebase (if new project)
```bash
npx firebase init
```

**Select:**
- ✅ Firestore
- Use default files: `firestore.rules` and `firestore.indexes.json`

### 4. Set Your Project ID
Edit `.firebaserc` and replace `your-firebase-project-id` with your actual project ID, OR run:
```bash
npx firebase use your-project-id
```

### 5. Create Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Firestore Database** → **Create Database**
4. Choose **Production mode** (or Test mode for dev)
5. Select location and click **Enable**

### 6. Get Service Account Key
1. Firebase Console → Project Settings → **Service Accounts**
2. Click **Generate New Private Key**
3. Save as `firebase-service-account-key.json` in project root

### 7. Update .env File
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json
```

### 8. Deploy Firestore Rules and Indexes
```bash
npx firebase deploy --only firestore
```

### 9. Test Connection
```bash
npm run build
npm start
```

You should see: `Firebase initialized successfully`

## All-in-One Commands (Copy & Paste)

```powershell
# 1. Login
npx firebase login

# 2. Initialize (select Firestore when prompted)
npx firebase init

# 3. Deploy rules and indexes
npx firebase deploy --only firestore

# 4. Build and test
npm run build
npm start
```

## Verify in Firebase Console

After running, check:
- **Firestore Database** → Should see collections: `programSnapshots`, `executionLogs`, `rateLimits`
- **Firestore Database** → Rules tab → Should show deployed rules
- **Firestore Database** → Indexes tab → Should show deployed indexes

Done! Your system is now connected to Firebase Firestore.

