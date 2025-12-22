# 🚀 Custom Domain Setup Guide

## Quick Setup Steps

### Step 1: Buy Domain (Recommended: Namecheap)

1. Go to https://www.namecheap.com
2. Search for: `canam-iapply.com`
3. Add to cart → Checkout (~$10.98/year)
4. Complete purchase

**Alternative:** Google Domains ($12/year) - https://domains.google

---

### Step 2: Configure in Firebase

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Hosting** → **Add custom domain**
4. Enter: `canam-iapply.com`
5. Click **Continue**

---

### Step 3: Add DNS Records

Firebase will show you DNS records to add. Go to your domain registrar:

**For Namecheap:**
1. Go to Domain List → Manage
2. Go to **Advanced DNS**
3. Add these records (Firebase will provide exact values):

```
Type: A
Host: @
Value: [Firebase IP]
TTL: Automatic

Type: A
Host: @
Value: [Firebase IP 2]
TTL: Automatic

Type: TXT
Host: @
Value: [Firebase verification string]
TTL: Automatic
```

**For Google Domains:**
1. Go to DNS settings
2. Add the same records

---

### Step 4: Wait for DNS Propagation

- Usually takes 1-24 hours
- Check status in Firebase Console
- Firebase will verify automatically

---

### Step 5: Update Code

Once verified, update Firebase config in:
- `public/index.html`
- `public/login.html`
- `public/admin.html`
- `public/create-user.html`
- `public/create-all-users.html`

**New config will be:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "canam-iapply.com", // Changed from .web.app
  projectId: "your-project-id",
  // ... rest stays same
};
```

---

### Step 6: Update Authorized Domains

1. Firebase Console → Authentication → Settings
2. Add to **Authorized domains:**
   - `canam-iapply.com`
   - `www.canam-iapply.com` (if using www)

---

### Step 7: Deploy

```bash
firebase deploy --only hosting
```

---

## ✅ Benefits After Setup

- ✅ Professional domain: `canam-iapply.com`
- ✅ No more "dangerous site" flags
- ✅ Professional email: `admin@canam-iapply.com`
- ✅ Better trust and credibility
- ✅ Future-proof

---

## 🆘 Need Help?

I can help you:
1. Choose the best domain name
2. Set up DNS records
3. Update all code files
4. Configure Firebase
5. Test everything

**Just let me know when you're ready!**

