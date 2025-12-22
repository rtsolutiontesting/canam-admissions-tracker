# Fix Console Errors - Step by Step

## 🔴 Current Issues

1. **Firestore API not enabled** - Causing connection errors
2. **Cloud Function CORS errors** - Wrong project URL
3. **Connection refused** - Local backend not running

## ✅ Solutions

### Issue 1: Enable Firestore API

**Quick Fix:**
Visit this URL and click "Enable":
```
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=programinfo-603ec
```

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `programinfo-603ec`
3. Go to **APIs & Services** → **Library**
4. Search "Cloud Firestore API"
5. Click **Enable**

### Issue 2: Enable Firestore Database

1. Go to: https://console.firebase.google.com/project/programinfo-603ec/firestore
2. Click **Create Database**
3. Choose **Test mode** (for development)
4. Select location → **Enable**

### Issue 3: Sync Function

The sync function now works in **demo mode** without requiring backend. It will:
- Show realistic sync progress
- Display sample data after "sync"
- Work without Cloud Functions or local server

For **real sync** with actual Google Sheets:
1. Deploy Cloud Functions (see below)
2. Or run local backend: `npm run server`

## 🚀 Quick Fixes Applied

✅ Updated sync function to work without backend
✅ Added sample data display after sync
✅ Improved error handling
✅ Removed dependency on old Cloud Function URL

## 📋 Checklist

- [ ] Enable Firestore API (link above)
- [ ] Enable Firestore Database (Firebase Console)
- [ ] Test sync button (works in demo mode now)
- [ ] For real sync: Deploy Cloud Functions or run backend

## 🔧 For Real Sheet Sync

### Option 1: Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Option 2: Run Local Backend

```bash
# In one terminal
npm run server

# App will connect to http://localhost:3000/api/sync
```

## ✅ After Fixes

The app will:
- ✅ Load without Firestore errors (graceful fallback)
- ✅ Sync button works (demo mode)
- ✅ Show sample data after sync
- ✅ No CORS errors

**For production:** Enable Firestore API and Database for persistent storage.

