# 🚀 Quick Guide: Set Up New Firebase Project

## Why New Project?

Starting fresh helps avoid "dangerous site" flags by:
- ✅ Clean project history
- ✅ Proper security headers from start
- ✅ Clear app description and purpose
- ✅ All security measures in place

## Quick Setup (5 Steps)

### Step 1: Create New Project

```bash
firebase login
firebase projects:create canam-admissions-tracker-v2
firebase use canam-admissions-tracker-v2
```

### Step 2: Initialize Services

```bash
# Initialize Firestore
firebase init firestore
# - Select: Use an existing project
# - Choose: canam-admissions-tracker-v2
# - Use default rules: Yes
# - Deploy rules: Yes

# Initialize Hosting
firebase init hosting
# - Select: Use an existing project
# - Choose: canam-admissions-tracker-v2
# - Public directory: public
# - Single-page app: No
# - GitHub setup: No
```

### Step 3: Enable APIs

Go to [Google Cloud Console](https://console.cloud.google.com/apis/library):

1. Select project: `canam-admissions-tracker-v2`
2. Enable these APIs:
   - ✅ Cloud Firestore API
   - ✅ Google Sheets API
   - ✅ Google Drive API
   - ✅ Identity Toolkit API

### Step 4: Configure Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `canam-admissions-tracker-v2`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password**
5. Go to **Settings** → **Authorized domains**
6. Add: `canam-admissions-tracker-v2.web.app`

### Step 5: Update & Deploy

1. **Get Firebase Config:**
   - Firebase Console → Project Settings → Your apps → Web app
   - Copy the config object

2. **Update HTML files:**
   - Update `public/index.html`
   - Update `public/login.html`
   - Update `public/admin.html`
   - Replace `firebaseConfig` with new values

3. **Deploy:**
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

## ✅ Security Features Already Added

Your app now has:
- ✅ Proper meta tags and descriptions
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ About page (`/about`)
- ✅ Privacy policy (`/privacy-policy`)
- ✅ robots.txt
- ✅ security.txt (`.well-known/security.txt`)

## 🎯 New Project Benefits

1. **Clean Slate**: No previous flags or issues
2. **Proper Setup**: All security measures from day one
3. **Better Naming**: Clear, professional project name
4. **Verified**: Can verify domain ownership properly

## 📝 After Deployment

1. **Test the app**: Visit `https://canam-admissions-tracker-v2.web.app`
2. **Verify security headers**: Use browser DevTools → Network tab
3. **Test authentication**: Create a test user and login
4. **Check console**: Ensure no errors

## 🚨 If Still Flagged

1. **Wait 24-48 hours** for Google to re-crawl
2. **Submit appeal** at [Google Safe Browsing](https://safebrowsing.google.com/safebrowsing/report_general/)
3. **Verify domain** in Google Search Console
4. **Contact support** with evidence of legitimate use

## 📞 Support

If you need help:
- Firebase Support: https://firebase.google.com/support
- Google Cloud Support: https://cloud.google.com/support

