# New Firebase Project Setup - Quick Guide

## ✅ Project Created Successfully!

**New Project:** `canam-admissions-tracker`  
**New URL:** `https://canam-admissions-tracker.web.app`

## 🔧 Next Steps

### 1. Get Firebase Config (IMPORTANT!)

1. Visit: https://console.firebase.google.com/project/canam-admissions-tracker/settings/general
2. Scroll to "Your apps" section
3. Click **Web** icon (`</>`)
4. Register app: Name it "Web App"
5. **Copy the firebaseConfig** - you'll need this!

### 2. Update App Files

Update Firebase config in these files:
- `public/index.html` (line ~490)
- `public/login.html` (find firebaseConfig)
- `public/admin.html` (if it has config)

Replace the old config with your new one.

### 3. Enable Services

**Authentication:**
- https://console.firebase.google.com/project/canam-admissions-tracker/authentication
- Enable Email/Password

**Firestore:**
- https://console.firebase.google.com/project/canam-admissions-tracker/firestore
- Create Database → Test mode → Enable

**Firestore API:**
- https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=canam-admissions-tracker
- Click Enable

### 4. Deploy

```bash
firebase deploy --only hosting
```

### 5. Access Your App

**New URL:** https://canam-admissions-tracker.web.app

## 📋 Quick Checklist

- [ ] Get new Firebase config from console
- [ ] Update config in `public/index.html`
- [ ] Update config in `public/login.html`
- [ ] Enable Authentication
- [ ] Enable Firestore Database
- [ ] Enable Firestore API
- [ ] Deploy hosting
- [ ] Test new URL

## 🎯 Your New App URL

Once deployed:
```
https://canam-admissions-tracker.web.app
```

This URL should NOT have any phishing warnings!

