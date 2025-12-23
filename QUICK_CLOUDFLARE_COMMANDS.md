# 🚀 Quick Cloudflare Commands

## ✅ **Setup Complete!**

Wrangler CLI is installed. Use these commands to control deployments.

---

## 📋 **Essential Commands:**

### **1. Login (First Time)**
```bash
npm run cf:login
```
Opens browser to authenticate.

---

### **2. Check Deployments**
```bash
npm run cf:deployments
```
Shows all deployments with status, commit, and URL.

---

### **3. View Live Logs**
```bash
npm run cf:tail
```
Streams real-time logs from latest deployment.

---

### **4. Check Login Status**
```bash
npm run cf:whoami
```

---

## 🔍 **Diagnosis Workflow:**

1. **Check deployments:**
   ```bash
   npm run cf:deployments
   ```

2. **View logs for specific deployment:**
   ```bash
   npx wrangler pages deployment get --project-name=canam-admissions-tracker --deployment-id=<ID>
   ```
   (Replace `<ID>` with deployment ID from step 1)

3. **Stream live logs:**
   ```bash
   npm run cf:tail
   ```

---

## 🎯 **Try It Now:**

Run this to see current deployments:
```bash
npm run cf:deployments
```

If not logged in, run:
```bash
npm run cf:login
```

---

## 📊 **What You'll See:**

- Deployment ID
- Status (Success/Failure)
- Commit hash
- Branch
- Created time
- Live URL

**All commands are ready to use!**



