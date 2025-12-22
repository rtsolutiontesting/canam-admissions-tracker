# Update App for New Firebase Project

## ✅ New Project Created!

**Project ID:** `canam-admissions-tracker`  
**New URL:** `https://canam-admissions-tracker.web.app`

## Step 1: Get New Firebase Config

1. Go to: https://console.firebase.google.com/project/canam-admissions-tracker/settings/general
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app (name it "Web App")
5. Copy the `firebaseConfig` object

## Step 2: Update App Configuration

The config will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "canam-admissions-tracker.firebaseapp.com",
  projectId: "canam-admissions-tracker",
  storageBucket: "canam-admissions-tracker.firebasestorage.app",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

Update this in:
- `public/index.html`
- `public/login.html`
- `public/admin.html`

## Step 3: Enable Required Services

### Enable Authentication:
1. Go to: https://console.firebase.google.com/project/canam-admissions-tracker/authentication
2. Click "Get Started"
3. Enable "Email/Password"

### Enable Firestore:
1. Go to: https://console.firebase.google.com/project/canam-admissions-tracker/firestore
2. Click "Create Database"
3. Choose "Test mode"
4. Select location → Enable

### Enable Firestore API:
Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=canam-admissions-tracker
Click "Enable"

## Step 4: Deploy

```bash
firebase deploy --only hosting
```

## Step 5: Test

Visit: https://canam-admissions-tracker.web.app

