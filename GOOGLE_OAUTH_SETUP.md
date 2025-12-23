# 🔐 Google OAuth 2.0 Setup Guide

## ✅ **What's New:**

Added **"Authorize Google Drive"** button before Step 1 that:
- ✅ Uses Google OAuth 2.0 for secure authentication
- ✅ Grants access to Google Sheets API v4
- ✅ Works with private sheets (no need to make them public)
- ✅ No CORS issues (uses official API)
- ✅ Better error handling

---

## 🚀 **Setup Instructions:**

### **Step 1: Create OAuth 2.0 Client ID**

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Select your project** (or create a new one)

3. **Enable APIs:**
   - Go to **APIs & Services** > **Library**
   - Search for **"Google Sheets API"** → Click **Enable**
   - Search for **"Google Drive API"** → Click **Enable**

4. **Create OAuth 2.0 Client ID:**
   - Go to **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - If prompted, configure OAuth consent screen:
     - User Type: **External** (or Internal if using Google Workspace)
     - App name: **CANAM IAPPLY**
     - User support email: Your email
     - Developer contact: Your email
     - Click **Save and Continue**
     - Scopes: Click **Add or Remove Scopes**
       - Add: `https://www.googleapis.com/auth/spreadsheets.readonly`
       - Add: `https://www.googleapis.com/auth/drive.readonly`
     - Click **Save and Continue**
     - Test users: Add your email (if using External)
     - Click **Save and Continue** > **Back to Dashboard**

5. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: **CANAM IAPPLY Web Client**
   - **Authorized JavaScript origins:**
     ```
     https://canam-admissions-tracker.pages.dev
     http://localhost:3000
     ```
   - **Authorized redirect URIs:** (leave empty for now)
   - Click **Create**

6. **Copy the Client ID:**
   - You'll see a popup with your **Client ID**
   - Copy it (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

---

### **Step 2: Update Code with Client ID**

1. **Open `public/index.html`**

2. **Find this line (around line 232):**
   ```javascript
   const GOOGLE_OAUTH_CLIENT_ID = 'YOUR_OAUTH_CLIENT_ID_HERE';
   ```

3. **Replace with your Client ID:**
   ```javascript
   const GOOGLE_OAUTH_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
   ```

4. **Save and commit:**
   ```bash
   git add public/index.html
   git commit -m "Add Google OAuth Client ID"
   git push origin main
   ```

---

## 🎯 **How It Works:**

### **New Workflow:**

1. **🔐 Authorize Google Drive** (NEW - Step 0)
   - Click button
   - Google login popup appears
   - Grant permissions
   - Token stored in memory

2. **📥 Step 1: Load Data from Sheet**
   - Uses Google Sheets API v4 (authenticated)
   - Works with private sheets
   - No CORS issues

3. **▶️ Step 3: Sync Now**
   - Processes data
   - Extracts information

---

## 🔒 **Security:**

- ✅ OAuth token stored in memory only (not persisted)
- ✅ Token expires after 1 hour (user re-authorizes if needed)
- ✅ Only requests read-only access
- ✅ No credentials in code (Client ID is public, safe to expose)

---

## 🐛 **Troubleshooting:**

### **"OAuth Client ID not configured"**
- Make sure you replaced `YOUR_OAUTH_CLIENT_ID_HERE` with your actual Client ID

### **"Access blocked: This app's request is invalid"**
- Check **Authorized JavaScript origins** includes your domain
- Make sure you enabled **Google Sheets API** and **Google Drive API**

### **"Error 403: Access denied"**
- Check OAuth consent screen is configured
- If using External user type, add your email as a test user

### **Token expires**
- Tokens expire after 1 hour
- User will need to click "Authorize Google Drive" again
- This is normal and secure

---

## 📋 **Quick Checklist:**

- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created (Web application)
- [ ] Authorized JavaScript origins added
- [ ] Client ID added to code
- [ ] Code committed and pushed

---

## 🚀 **After Setup:**

1. **Wait for deployment** (2-3 minutes)
2. **Click "🔐 Authorize Google Drive"**
3. **Login with Google account**
4. **Grant permissions**
5. **Click "📥 Step 1: Load Data from Sheet"**
6. **Data loads successfully!**

**No more CORS errors! No more "sheet is private" errors!**


