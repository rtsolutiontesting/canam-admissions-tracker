# User Credentials Guide

## 🔐 Default Test Users

These users are pre-configured for testing:

### Admin User
- **Email:** `admin@canamiapply.com`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Access:** Full access to all features

### Manager User
- **Email:** `manager@canamiapply.com`
- **Password:** `Manager@123`
- **Role:** MANAGER
- **Access:** Management features

### Regular User
- **Email:** `user@canamiapply.com`
- **Password:** `User@123`
- **Role:** USER
- **Access:** Standard user features

## 📝 How to Create Users

### Option 1: Via Web Interface (Easiest)

1. Visit: https://programinfo-603ec.web.app/create-user.html
2. Fill in the form:
   - Email
   - Password (min 6 characters)
   - Display Name
3. Click "Create User"
4. User will be created and can login immediately

### Option 2: Via Login Page

1. Visit: https://programinfo-603ec.web.app/login.html
2. Click "Create New Account"
3. Enter email and password
4. Account created automatically

### Option 3: Via Firebase Console

1. Go to: https://console.firebase.google.com/project/programinfo-603ec/authentication/users
2. Click "Add User"
3. Enter email and password
4. Click "Add"

### Option 4: Via Script (Bulk Creation)

```bash
# Make sure .env has FIREBASE_SERVICE_ACCOUNT_KEY_PATH set
npm run create-users
```

This will create the default test users listed above.

## 🚀 Quick Login

**App URL:** https://programinfo-603ec.web.app

**Login with:**
- Email: `admin@canamiapply.com`
- Password: `Admin@123`

## ⚠️ Important Notes

1. **First Time:** You need to create users first (they don't exist automatically)
2. **Password Requirements:** Minimum 6 characters
3. **Email Verification:** Can be enabled in Firebase Console
4. **Security:** Change default passwords in production!

## 📋 Create Users Checklist

- [ ] Enable Authentication in Firebase Console
- [ ] Create users via web interface OR script
- [ ] Test login with created credentials
- [ ] Change default passwords for production use

## 🔧 Troubleshooting

### "User not found"
- User hasn't been created yet
- Use create-user.html page to create

### "Email already exists"
- User already exists
- Try logging in instead

### "Password too weak"
- Use at least 6 characters
- Include numbers and letters

### "Authentication not enabled"
- Go to Firebase Console → Authentication
- Click "Get Started"
- Enable "Email/Password"

---

**Ready to login?** Visit: https://programinfo-603ec.web.app/login.html

