# Authentication Setup Guide

## ✅ What's Been Added

1. **Login Page** (`login.html`) - Entry point for authentication
2. **User Profile Icon** - Top right corner of dashboard
3. **Authentication Check** - Dashboard redirects to login if not authenticated
4. **Logout Functionality** - Sign out from profile dropdown
5. **Firestore Rules** - Now require authentication to read/write

## 🔐 How to Use

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/program-info-extractor/authentication)
2. Click **Get Started**
3. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" 
   - Click **Save**

### Step 2: Create First User

**Option A: Via Login Page**
1. Visit: https://program-info-extractor.web.app/login.html
2. Click **Create New Account**
3. Enter email and password (min 6 characters)
4. Account will be created and you'll be signed in

**Option B: Via Firebase Console**
1. Go to [Authentication Users](https://console.firebase.google.com/project/program-info-extractor/authentication/users)
2. Click **Add User**
3. Enter email and password
4. Click **Add**

### Step 3: Access Dashboard

1. Visit: https://program-info-extractor.web.app
2. You'll be redirected to login page
3. Sign in with your credentials
4. You'll see the dashboard with your profile icon in the top right

## 👤 User Profile Icon

The profile icon shows:
- **Initial**: First letter of your email (capitalized)
- **Color**: Purple gradient matching the app theme
- **Location**: Top right corner of the header

Click the icon to see:
- Your name/email
- Admin Panel link
- Sign Out option

## 🔒 Security Features

- **Authentication Required**: All Firestore reads/writes require login
- **Session Management**: Stays logged in until you sign out
- **Auto-redirect**: Unauthenticated users redirected to login
- **Secure Rules**: Firestore rules enforce authentication

## 📋 Default Credentials

The login page shows demo credentials, but you need to create an account first.

**To create admin account:**
1. Visit login page
2. Click "Create New Account"
3. Use: `admin@admissions.com` / `admin123`
4. Or create your own account

## 🚀 Live URLs

- **Login Page**: https://program-info-extractor.web.app/login.html
- **Dashboard**: https://program-info-extractor.web.app/index.html (requires login)
- **Admin Panel**: https://program-info-extractor.web.app/admin.html (requires login)

## ⚠️ Important Notes

1. **Firestore must be enabled** before authentication will work
2. **Email/Password auth must be enabled** in Firebase Console
3. **First user** must be created via login page or Firebase Console
4. **Firestore rules** now require authentication - old public access removed

## 🔧 Troubleshooting

### "Site Not Found" or redirects to login
- This is normal! The app now requires login
- Visit: https://program-info-extractor.web.app/login.html

### "Permission denied" when loading data
- Make sure you're logged in
- Check Firestore rules are deployed
- Verify Email/Password auth is enabled

### Can't create account
- Check Email/Password auth is enabled in Firebase Console
- Password must be at least 6 characters
- Email must be valid format

### Profile icon not showing
- Make sure you're logged in
- Check browser console for errors
- Refresh the page

## 📱 User Management

**View all users:**
- Firebase Console → Authentication → Users

**Delete users:**
- Firebase Console → Authentication → Users → Select user → Delete

**Reset password:**
- Users can use "Forgot password" (if implemented)
- Or reset via Firebase Console

---

**Your app now has full authentication!** 🎉

