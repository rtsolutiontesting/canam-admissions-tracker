# 📊 Google Sheets Integration Setup

## ⚠️ **IMPORTANT: OAuth Client ID Required**

The Google Sheets integration requires a **Google OAuth 2.0 Client ID** to authenticate.

---

## 🔧 **Setup Steps:**

### **1. Create Google OAuth Client ID**

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Create or select a project**
3. **Enable Google Sheets API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "CANAM IAPPLY Sheets Access"
   - Authorized JavaScript origins:
     - `https://canam-admissions-tracker.pages.dev`
     - `http://localhost:3000` (for local testing)
   - Authorized redirect URIs:
     - `https://canam-admissions-tracker.pages.dev`
     - `http://localhost:3000`
   - Click "Create"
   - **Copy the Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

---

### **2. Update Code with Client ID**

Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` in `public/index.html` with your actual Client ID:

```javascript
client_id: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
```

**There are TWO places to update:**
1. In `checkAuthStatus()` function
2. In `handleAuthClick()` function

---

## 🎯 **Features:**

### **1. Authentication Button**
- Shows "🔐 Authenticate Google Sheets" button
- Click to authenticate with Google
- Grants read-only access to Google Sheets

### **2. Load Data Button**
- Enabled after authentication
- Fetches **REAL data** from the provided Google Sheet URL
- Shows progress bar during loading

### **3. Progress Bar**
- Shows percentage (0-100%)
- Shows current step (Connecting, Reading, Processing, etc.)
- Updates in real-time

### **4. Real Data Display**
- Fetches actual data from Google Sheet
- Displays in table
- **NO mock/dummy data**

---

## 📋 **How It Works:**

1. **User enters Google Sheet URL**
2. **Clicks "Authenticate Google Sheets"**
3. **Google OAuth popup appears**
4. **User grants permission**
5. **"Load Data" button becomes enabled**
6. **User clicks "Load Data"**
7. **Progress bar shows:**
   - 10%: Connecting to Google Sheets
   - 30%: Reading sheet data
   - 50%: Processing data
   - 70%: Formatting data
   - 90%: Displaying data
   - 100%: Complete
8. **Data appears in table**
9. **CSV download uses real data**

---

## 🔍 **Data Columns Detected:**

The system automatically detects these columns (case-insensitive):
- **University** / University Name
- **Program** / Program Name
- **Status** / Intake Status
- **Deadline** / Application Deadline
- **Intake** / Intake Offered
- **CAS** / CAS Deadline
- **I-20** / I-20 Deadline
- **Alert** / Note / Admission Alert
- **Last Checked**

---

## ✅ **After Setup:**

1. **Deploy the updated code**
2. **Visit the dashboard**
3. **Click "Authenticate Google Sheets"**
4. **Grant permission**
5. **Enter your sheet URL**
6. **Click "Load Data"**
7. **See real data!**

---

## 🆘 **Troubleshooting:**

### **"Google API not loaded" error:**
- Wait a few seconds and try again
- Check browser console for errors
- Ensure Google API scripts are loading

### **"Invalid Google Sheets URL":**
- URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...`
- Make sure the sheet is shared (if needed)

### **"Authentication failed":**
- Check OAuth Client ID is correct
- Verify authorized origins include your domain
- Check browser console for detailed errors

---

## 📝 **Note:**

The sheet must be:
- **Accessible** (shared with the authenticated user if needed)
- **Has headers in first row**
- **Contains data in subsequent rows**

**The system reads ALL rows and displays them in the table!**

