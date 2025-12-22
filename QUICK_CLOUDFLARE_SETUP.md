# ⚡ Quick Cloudflare Pages Setup (5 Steps)

## 🎯 Goal
Deploy your app to Cloudflare Pages for FREE with no "dangerous site" flags.

---

## Step 1: Create GitHub Repository (2 min)

1. Go to: https://github.com/new
2. Name: `canam-admissions-tracker`
3. Make it **Public**
4. Click **Create repository**

---

## Step 2: Push Code to GitHub (3 min)

Run these commands in your project folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CANAM IAPPLY"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/canam-admissions-tracker.git

# Push
git branch -M main
git push -u origin main
```

**Need help?** I can guide you through this!

---

## Step 3: Sign Up for Cloudflare (1 min)

1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up (free)
3. Verify email

---

## Step 4: Deploy to Cloudflare Pages (5 min)

1. Go to: https://dash.cloudflare.com
2. Click **Workers & Pages** → **Pages**
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize GitHub access
6. Select: `canam-admissions-tracker`
7. Configure:
   - **Build output directory:** `public`
   - **Framework preset:** None
8. Click **Save and Deploy**

**Wait 2-3 minutes** → Your site is live!

---

## Step 5: Get Your URL

After deployment, you'll get:
- `https://canam-admissions-tracker.pages.dev`

**That's it! Your app is live! 🎉**

---

## 🌐 Optional: Add Custom Domain (FREE)

1. In your Cloudflare Pages project
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `canam-iapply.com`)
5. Follow DNS instructions
6. **SSL is automatic and FREE!**

---

## ✅ Benefits

- ✅ **100% FREE**
- ✅ **No flags** (Cloudflare has excellent reputation)
- ✅ **Fast CDN**
- ✅ **Unlimited bandwidth**
- ✅ **Auto-deploy** on git push
- ✅ **Free SSL**

---

## 🆘 Need Help?

Tell me when you're ready and I'll guide you through each step!

**Questions?**
- Don't have GitHub? I'll help you create one
- Git commands confusing? I'll explain
- Cloudflare setup? I'll walk you through it

**Ready to start? Let me know!**

