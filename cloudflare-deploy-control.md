# 🔧 Cloudflare Deployment Control from Terminal

## ✅ **Setup Cloudflare CLI (Wrangler)**

We'll use Wrangler CLI to control and monitor Cloudflare Pages deployments.

---

## 📋 **Commands Available:**

### **1. Login to Cloudflare**
```bash
wrangler login
```

### **2. List Pages Projects**
```bash
wrangler pages project list
```

### **3. List Deployments**
```bash
wrangler pages deployment list --project-name=canam-admissions-tracker
```

### **4. Get Deployment Details**
```bash
wrangler pages deployment tail --project-name=canam-admissions-tracker
```

### **5. Retry Deployment**
```bash
wrangler pages deployment retry --project-name=canam-admissions-tracker --deployment-id=<ID>
```

### **6. Get Build Logs**
```bash
wrangler pages deployment get --project-name=canam-admissions-tracker --deployment-id=<ID>
```

---

## 🚀 **Let's Set It Up!**



