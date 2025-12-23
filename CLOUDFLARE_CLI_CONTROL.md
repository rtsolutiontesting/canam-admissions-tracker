# 🔧 Cloudflare Deployment Control from Terminal

## ✅ **Setup Complete!**

Wrangler CLI is installed. You can now control and monitor Cloudflare Pages deployments from the terminal.

---

## 🚀 **Quick Start:**

### **1. Login to Cloudflare**
```bash
npm run cf:login
```
Or:
```bash
npx wrangler login
```

This will open a browser to authenticate with Cloudflare.

---

## 📋 **Available Commands:**

### **Check Login Status**
```bash
npm run cf:whoami
```

### **List All Pages Projects**
```bash
npm run cf:projects
```

### **List Deployments**
```bash
npm run cf:deployments
```

### **View Live Deployment Logs**
```bash
npm run cf:tail
```

### **Get Deployment Status (JSON)**
```bash
npm run cf:status
```

---

## 🔍 **Detailed Commands:**

### **Get Specific Deployment Details**
```bash
npx wrangler pages deployment get --project-name=canam-admissions-tracker --deployment-id=<ID>
```

### **Retry a Failed Deployment**
```bash
npx wrangler pages deployment retry --project-name=canam-admissions-tracker --deployment-id=<ID>
```

### **View Build Logs**
```bash
npx wrangler pages deployment tail --project-name=canam-admissions-tracker
```

### **Get Project Settings**
```bash
npx wrangler pages project get canam-admissions-tracker
```

---

## 🎯 **Diagnosis Workflow:**

### **1. Check Current Deployments**
```bash
npm run cf:deployments
```

This shows:
- Deployment ID
- Status (Success/Failure)
- Commit hash
- Build time
- Live URL

### **2. View Live Logs**
```bash
npm run cf:tail
```

This streams real-time logs from the latest deployment.

### **3. Get Detailed Info**
```bash
npx wrangler pages deployment get --project-name=canam-admissions-tracker --deployment-id=<ID>
```

Replace `<ID>` with the deployment ID from step 1.

---

## 📊 **Example Output:**

### **List Deployments:**
```
Deployment ID: abc123...
Status: Success
Commit: 14056cf
Branch: main
Created: 2025-12-22T21:40:00Z
URL: https://abc123.canam-admissions-tracker.pages.dev
```

### **View Logs:**
```
[21:40:15] Cloning repository...
[21:40:16] Building application...
[21:40:20] Deploying to Cloudflare...
[21:40:25] ✅ Success!
```

---

## 🆘 **Troubleshooting:**

### **If "Not logged in" error:**
```bash
npm run cf:login
```

### **If "Project not found" error:**
Check project name:
```bash
npm run cf:projects
```

### **If deployment failed:**
1. Get deployment ID: `npm run cf:deployments`
2. View logs: `npx wrangler pages deployment get --project-name=canam-admissions-tracker --deployment-id=<ID>`
3. Check build output directory setting in Cloudflare dashboard

---

## 🎯 **Next Steps:**

1. **Login:** `npm run cf:login`
2. **Check deployments:** `npm run cf:deployments`
3. **View logs:** `npm run cf:tail`

**Now you can diagnose deployment issues directly from the terminal!**



