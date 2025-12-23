# ✅ Quick OAuth Setup - You're Almost There!

## 🎯 **What You Have:**

✅ OAuth Client ID created: `https://canam-admissions-tracker.pages.dev`
✅ Client ID: `278548161456-f52u...` (you need the full ID)

---

## 📋 **Next Steps:**

### **Step 1: Copy Full Client ID**

1. **In Google Cloud Console**, click the **copy icon** (📋) next to the Client ID
   - The one for `https://canam-admissions-tracker.pages.dev`
   - It should look like: `278548161456-f52u...` (full version)

2. **Verify Authorized JavaScript Origins:**
   - Click the **edit icon** (✏️) next to your Client ID
   - Under **"Authorized JavaScript origins"**, make sure you have:
     ```
     https://canam-admissions-tracker.pages.dev
     ```
   - If not, add it and click **Save**

---

### **Step 2: Update Code with Client ID**

1. **Open `public/index.html`**

2. **Find this line (around line 244):**
   ```javascript
   const GOOGLE_OAUTH_CLIENT_ID = 'YOUR_OAUTH_CLIENT_ID_HERE';
   ```

3. **Replace with your full Client ID:**
   ```javascript
   const GOOGLE_OAUTH_CLIENT_ID = '278548161456-f52u...'; // Your full Client ID here
   ```

4. **Save the file**

---

### **Step 3: Commit and Deploy**

```bash
git add public/index.html
git commit -m "Add Google OAuth Client ID"
git push origin main
```

---

### **Step 4: Test**

1. **Wait 2-3 minutes** for deployment
2. **Visit:** `https://canam-admissions-tracker.pages.dev`
3. **Click:** "🔐 Authorize Google Drive"
4. **Login** with your Google account
5. **Grant permissions**
6. **Enter your sheet URL**
7. **Click:** "📥 Step 1: Load Data from Sheet"

---

## ✅ **Checklist:**

- [ ] Copied full Client ID from Google Cloud Console
- [ ] Verified authorized JavaScript origins include `https://canam-admissions-tracker.pages.dev`
- [ ] Updated `GOOGLE_OAUTH_CLIENT_ID` in `public/index.html`
- [ ] Committed and pushed to GitHub
- [ ] Waited for deployment
- [ ] Tested authorization button

---

## 🎯 **You're Doing Great!**

Everything is set up correctly. Just need to:
1. Copy the full Client ID
2. Paste it in the code
3. Deploy and test!

**You're almost there!** 🚀


