# Where Is The App? 🎯

## 🌐 Live Application URLs

### Main Application
**Primary URL:**
```
https://program-info-extractor.web.app
```

**Direct Dashboard (after login):**
```
https://program-info-extractor.web.app/index.html
```

**Login Page:**
```
https://program-info-extractor.web.app/login.html
```

## 📍 How to Access

### Step 1: Open in Browser
1. Open Chrome, Firefox, or any browser
2. Go to: `https://program-info-extractor.web.app`
3. You'll see the login page

### Step 2: Login
- If you have an account: Enter email and password
- If no account: Click "Create New Account" to create one

### Step 3: Access Dashboard
- After login, you'll see the **CANAM IAPPLY Dashboard**
- Dark blue sidebar on the left
- Main content area with:
  - Workflow Control
  - Master Data Preview
  - Live Execution Stream

## 🔧 Current Status

### ✅ What's Working
- ✅ App is deployed and live
- ✅ UI matches your design
- ✅ Authentication system
- ✅ Dashboard interface

### ⚠️ What Needs Fixing
- ⚠️ Firestore API needs to be enabled (causing console errors)
- ⚠️ Backend server needs to run for real sync

## 🚀 Quick Fix

### Enable Firestore API (Fixes Console Error)

**Click this link and enable:**
```
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=program-info-extractor
```

Or:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `program-info-extractor`
3. Go to **APIs & Services** → **Library**
4. Search "Cloud Firestore API"
5. Click **Enable**

### Enable Firestore Database

1. Go to: https://console.firebase.google.com/project/program-info-extractor/firestore
2. Click **Create Database**
3. Choose **Test mode**
4. Select location → **Enable**

## 📱 App Features

### Dashboard Sections:
1. **Workflow Control**
   - Enter Google Sheet URL
   - Click "Run Manual Sync"

2. **Master Data Preview**
   - Shows all programs
   - Status indicators (CHANGED/NEW/LOST)
   - Data table

3. **Live Execution Stream**
   - Real-time sync progress
   - Error messages
   - Success notifications

## 🔐 Login Credentials

**Create your account:**
1. Visit: https://program-info-extractor.web.app/login.html
2. Click "Create New Account"
3. Enter email and password (min 6 characters)

**Or use demo (after creating):**
- Email: `admin@admissions.com`
- Password: `admin123`

## 🖥️ Local Development

If you want to run locally:

```bash
# Install dependencies
npm install

# Start backend server
npm run server

# App is at: http://localhost:3000
```

## 📊 Firebase Console

View your app data:
- **Firebase Console:** https://console.firebase.google.com/project/program-info-extractor
- **Firestore Data:** https://console.firebase.google.com/project/program-info-extractor/firestore
- **Authentication:** https://console.firebase.google.com/project/program-info-extractor/authentication

## ✅ Summary

**Your app is LIVE at:**
👉 **https://program-info-extractor.web.app**

**Just enable Firestore API to fix the console error!**

