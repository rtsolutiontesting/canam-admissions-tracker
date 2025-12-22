# 🚀 Deployment Guide - Step by Step

## 📋 **Step 1: Configure Git (If Needed)**

If you haven't set up git, run these:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📋 **Step 2: Create GitHub Repository**

1. **Go to:** https://github.com/new
2. **Repository name:** `canam-admissions-tracker`
3. **Description:** "University Admissions Data Management System"
4. **Make it:** Public ✅
5. **Don't check:** "Initialize with README"
6. **Click:** Create repository

**After creating, GitHub will show you commands. Copy the repository URL!**

---

## 📋 **Step 3: Push Code to GitHub**

After creating the repo, run these commands:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - CANAM IAPPLY Admissions Tracker"

# Add remote (REPLACE YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/canam-admissions-tracker.git

# Push
git branch -M main
git push -u origin main
```

**If asked for credentials, use your GitHub username and a Personal Access Token (not password).**

---

## 📋 **Step 4: Deploy to Cloudflare Pages**

1. **Go to:** https://dash.cloudflare.com/sign-up
2. **Sign up** (free account)
3. **Verify email** (check your inbox)
4. **Go to:** Workers & Pages → Pages
5. **Click:** Create a project
6. **Click:** Connect to Git
7. **Authorize** Cloudflare to access GitHub
8. **Select repository:** `canam-admissions-tracker`
9. **Configure:**
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `public`
   - **Root directory:** `/` (root)
10. **Click:** Save and Deploy

**Wait 2-3 minutes for deployment!**

---

## 🌐 **Step 5: Get Your URL**

After deployment completes:
- Go to your Cloudflare Pages project
- You'll see: **Production URL**
- It will be: `https://canam-admissions-tracker.pages.dev`

**That's your live URL!**

---

## 🔑 **Step 6: Login Credentials**

Use these credentials to login:

**Admin User:**
- Email: `admin@canamiapply.com`
- Password: `Admin@123`

**Manager User:**
- Email: `manager@canamiapply.com`
- Password: `Manager@123`

**Regular User:**
- Email: `user@canamiapply.com`
- Password: `User@123`

**Note:** If users don't exist yet, you can create them using the `/create-all-users.html` page after deployment.

---

## ✅ **After Deployment**

1. **Visit your URL:** `https://canam-admissions-tracker.pages.dev`
2. **Login** with credentials above
3. **Test the app!**

---

## 🆘 **Need Help?**

If you get stuck at any step, tell me:
- Which step you're on
- What error you see
- I'll help you fix it!

