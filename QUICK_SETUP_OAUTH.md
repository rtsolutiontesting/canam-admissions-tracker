# 🚀 Quick OAuth Setup Guide

## ⚡ **Fast Setup (5 minutes):**

### **Step 1: Get OAuth Client ID**

1. Go to: https://console.cloud.google.com/
2. Create/Select project
3. Enable "Google Sheets API"
4. Create OAuth 2.0 Client ID (Web application)
5. Copy Client ID

### **Step 2: Update Code**

In `public/index.html`, find and replace:
```javascript
client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
```

Replace with your actual Client ID (2 places).

### **Step 3: Deploy**

Code is already pushed. Just update the Client ID and redeploy.

---

## ✅ **That's it!**

After setup:
1. Visit dashboard
2. Click "Authenticate Google Sheets"
3. Grant permission
4. Enter sheet URL
5. Click "Load Data"
6. See real data!



