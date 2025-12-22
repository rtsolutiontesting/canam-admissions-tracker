# New Hosting Setup Guide

## 🎯 Preventing "Dangerous Site" Flags

To prevent your app from being flagged as "dangerous", we've added:

### ✅ Security Measures Added

1. **Proper Meta Tags**
   - Clear description of app purpose
   - Author information
   - Theme color
   - Canonical URL

2. **Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: Restricted

3. **Content Pages**
   - `/about.html` - Clear description of app purpose
   - `/privacy-policy.html` - Privacy policy
   - `/robots.txt` - Proper robots configuration

4. **Security.txt**
   - Contact information for security issues
   - Located at `/.well-known/security.txt`

## 🚀 Setting Up New Firebase Project

### Step 1: Create New Firebase Project

```bash
# Login to Firebase
firebase login

# Create new project
firebase projects:create canam-admissions-tracker-new

# Use the new project
firebase use canam-admissions-tracker-new
```

### Step 2: Initialize Firebase Services

```bash
# Initialize Firestore
firebase init firestore

# Initialize Hosting
firebase init hosting
# - Select: Use an existing project
# - Public directory: public
# - Single-page app: No
# - Set up automatic builds: No
```

### Step 3: Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. **Select your Firebase project**
2. **Enable APIs:**
   - Cloud Firestore API
   - Google Sheets API
   - Google Drive API (for Sheets access)
   - Identity Toolkit API (for Authentication)

### Step 4: Configure Authentication

1. Go to Firebase Console → Authentication
2. Enable **Email/Password** provider
3. Add authorized domains:
   - `canam-admissions-tracker-new.web.app`
   - `canam-admissions-tracker-new.firebaseapp.com`
   - Your custom domain (if any)

### Step 5: Update Firebase Config

Update `public/index.html`, `public/login.html`, etc. with new Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_NEW_API_KEY",
  authDomain: "canam-admissions-tracker-new.firebaseapp.com",
  projectId: "canam-admissions-tracker-new",
  storageBucket: "canam-admissions-tracker-new.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Step 6: Deploy

```bash
# Deploy hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

## 📋 Pre-Deployment Checklist

- [ ] New Firebase project created
- [ ] All required APIs enabled
- [ ] Authentication configured
- [ ] Firebase config updated in all HTML files
- [ ] `.firebaserc` updated with new project ID
- [ ] Security headers verified in `firebase.json`
- [ ] About page and privacy policy pages exist
- [ ] robots.txt file exists
- [ ] Test login functionality
- [ ] Verify no console errors

## 🔒 Additional Security Recommendations

### 1. Domain Verification
- Add your domain to Google Search Console
- Verify ownership
- Submit sitemap (if needed)

### 2. Content Security
- Ensure all content clearly describes legitimate business purpose
- Avoid generic or suspicious-sounding descriptions
- Include contact information

### 3. Authentication
- Require authentication for all sensitive pages
- Use strong password requirements
- Enable email verification

### 4. Monitoring
- Set up Firebase Analytics
- Monitor for suspicious activity
- Keep logs of legitimate usage

## 🚨 If Still Flagged

If your site is still flagged as dangerous:

1. **Submit Appeal to Google:**
   - Go to [Google Safe Browsing](https://safebrowsing.google.com/safebrowsing/report_general/)
   - Report false positive
   - Provide clear explanation of app purpose

2. **Verify Ownership:**
   - Add domain to Google Search Console
   - Verify via DNS or HTML file
   - Submit for review

3. **Contact Support:**
   - Firebase Support
   - Google Cloud Support
   - Provide evidence of legitimate use

## 📝 Environment Variables for New Project

Update your `.env` file:

```env
# Firebase
FIREBASE_PROJECT_ID=canam-admissions-tracker-new
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account-key.json

# Google Sheets (same as before)
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json

# Google AI (same as before)
GOOGLE_AI_API_KEY=your_ai_api_key
```

## ✅ Post-Deployment Verification

After deployment, verify:

1. **Site loads correctly**
2. **No console errors**
3. **Authentication works**
4. **All pages accessible**
5. **Security headers present** (check in browser DevTools → Network)
6. **About page accessible** at `/about`
7. **Privacy policy accessible** at `/privacy-policy`

## 🎉 Success Indicators

Your site should NOT be flagged if:
- ✅ Clear purpose and description
- ✅ Proper authentication
- ✅ Security headers configured
- ✅ Contact information available
- ✅ Privacy policy present
- ✅ No suspicious redirects
- ✅ Legitimate business use case

