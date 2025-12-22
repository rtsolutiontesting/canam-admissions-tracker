# Quick Deploy Guide - Live Dashboard & Mock Data

## 🚀 Step-by-Step Deployment

### Step 1: Enable Firestore (if not done)
1. Go to: https://console.firebase.google.com/project/program-info-extractor/firestore
2. Click **Create Database**
3. Choose **Test mode** (for development) or **Production mode**
4. Select location and click **Enable**

### Step 2: Deploy Firestore Rules
```bash
npx firebase deploy --only firestore:rules
```

### Step 3: Seed Mock Data
```bash
npm run seed
```

This creates:
- ✅ 6 mock university programs (MIT, Harvard, Oxford, Stanford, Cambridge, UC Berkeley)
- ✅ 2 execution logs
- ✅ Rate limits initialization

### Step 4: Enable Firebase Hosting
```bash
npx firebase init hosting
```

**Select:**
- ✅ Use existing `public` directory
- ✅ Single-page app: **Yes**
- ✅ Don't overwrite `index.html` (we already have one)

### Step 5: Deploy Web Dashboard
```bash
npm run firebase:deploy:hosting
```

### Step 6: Get Your Live URL

After deployment, you'll see:
```
✔  Deploy complete!

Hosting URL: https://program-info-extractor.web.app
```

## 📊 Live Dashboard URLs

Once deployed, access your dashboard at:

**Primary URL:**
```
https://program-info-extractor.web.app
```

**Alternative URL:**
```
https://program-info-extractor.firebaseapp.com
```

## 🔐 Access Information

**Important:** This is a **read-only dashboard** - no login required!

- **Access:** Public (anyone with the URL can view)
- **Authentication:** None (read-only dashboard)
- **Data Source:** Firestore database

## 📋 Mock Data Overview

### Programs in Database:
1. **MIT - Computer Science** (USA) - Status: Open
2. **Harvard - MBA** (USA) - Status: Open  
3. **Oxford - Computer Science** (UK) - Status: Open
4. **Stanford - Data Science** (USA) - Status: Open
5. **Cambridge - Engineering** (UK) - Status: Closed
6. **UC Berkeley - AI** (USA) - Status: Waitlist

### Features:
- Real-time data from Firestore
- Auto-refresh every 30 seconds
- Statistics dashboard
- Execution logs view
- Program status tracking

## 🔄 Update Mock Data

To add more mock data or refresh:

```bash
npm run seed
```

## 🗄️ View Data in Firebase Console

Direct Firestore access:
```
https://console.firebase.google.com/project/program-info-extractor/firestore
```

Collections:
- `programSnapshots` - All program data
- `executionLogs` - Execution history
- `rateLimits` - Rate limiting state

## 🛠️ Troubleshooting

### Dashboard shows "No programs found"
- Run: `npm run seed`
- Check Firestore rules are deployed
- Verify Firestore is enabled

### Hosting deploy fails
- Enable Hosting in Firebase Console
- Run: `firebase init hosting` again
- Select existing `public` folder

### Data not showing
- Check browser console for errors
- Verify Firestore rules allow read access
- Ensure data was seeded: `npm run seed`

## 📱 Dashboard Features

- **Statistics Cards:** Total programs, open/closed counts
- **Programs Table:** All program snapshots with status
- **Execution Logs:** Recent execution history
- **Auto-refresh:** Updates every 30 seconds
- **Responsive Design:** Works on mobile and desktop

## 🔒 Security Note

Current setup allows **public read access** for the dashboard. For production:
1. Add Firebase Authentication
2. Update `firestore.rules` to require auth
3. Add login page to dashboard

---

**Your live dashboard is ready!** 🎉

Visit: **https://program-info-extractor.web.app**

