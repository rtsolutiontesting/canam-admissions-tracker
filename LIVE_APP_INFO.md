# 🚀 Live App Information & Credentials

## 📍 Live Dashboard URLs

Once deployed, your dashboard will be available at:

**Primary URL:**
```
https://program-info-extractor.web.app
```

**Alternative URL:**
```
https://program-info-extractor.firebaseapp.com
```

## 🔐 Access Information

**Important:** This is a **read-only public dashboard** - no login credentials needed!

- **Access Type:** Public (anyone with URL can view)
- **Authentication:** None required
- **Permissions:** Read-only access to Firestore data
- **Auto-refresh:** Every 30 seconds

## 📊 What's Included

### Mock Data (6 Programs):
1. **MIT - Computer Science** (USA) - Status: Open
2. **Harvard - MBA** (USA) - Status: Open
3. **Oxford - Computer Science** (UK) - Status: Open
4. **Stanford - Data Science** (USA) - Status: Open
5. **Cambridge - Engineering** (UK) - Status: Closed
6. **UC Berkeley - AI** (USA) - Status: Waitlist

### Execution Logs:
- 2 sample execution logs with statistics

## 🚀 Deployment Steps

### 1. Enable Firestore (if not done)
Visit: https://console.firebase.google.com/project/program-info-extractor/firestore
- Click **Create Database**
- Choose **Test mode** or **Production mode**
- Select location → **Enable**

### 2. Seed Mock Data
```bash
npm run seed
```

### 3. Enable & Deploy Hosting
```bash
# Initialize hosting (first time only)
npx firebase init hosting
# Select: Use existing public folder, Single-page app: Yes

# Deploy
npm run firebase:deploy:hosting
```

### 4. Access Your Dashboard
After deployment, visit:
```
https://program-info-extractor.web.app
```

## 📋 Firebase Project Details

- **Project ID:** `program-info-extractor`
- **Project Number:** `666826748270`
- **Firebase Console:** https://console.firebase.google.com/project/program-info-extractor

## 🗄️ Database Collections

### programSnapshots
- Stores program admission data
- Fields: intakeOffered, intakeStatus, deadlines, alerts
- **View:** https://console.firebase.google.com/project/program-info-extractor/firestore/data/~2FprogramSnapshots

### executionLogs
- Stores execution history
- Fields: startTime, endTime, success/failure counts
- **View:** https://console.firebase.google.com/project/program-info-extractor/firestore/data/~2FexecutionLogs

### rateLimits
- Stores rate limiting state
- **View:** https://console.firebase.google.com/project/program-info-extractor/firestore/data/~2FrateLimits

## 🔄 Update Data

### Add More Mock Data:
```bash
npm run seed
```

### View in Firebase Console:
```
https://console.firebase.google.com/project/program-info-extractor/firestore
```

## 🎯 Dashboard Features

- ✅ Real-time statistics (total programs, open/closed counts)
- ✅ Programs table with status badges
- ✅ Execution logs with success/failure metrics
- ✅ Auto-refresh every 30 seconds
- ✅ Responsive design (mobile & desktop)
- ✅ Color-coded status indicators

## 🔒 Security & Access

### Current Setup:
- **Read Access:** Public (anyone can view)
- **Write Access:** Service account only (via Admin SDK)
- **Authentication:** None (read-only dashboard)

### For Production (Recommended):
1. Add Firebase Authentication
2. Update `firestore.rules` to require auth
3. Add login page to dashboard

## 📱 Quick Commands

```bash
# Seed mock data
npm run seed

# Deploy hosting
npm run firebase:deploy:hosting

# Deploy everything
npm run firebase:deploy:all

# View logs
npx firebase functions:log
```

## 🆘 Troubleshooting

### Dashboard shows "No programs found"
```bash
npm run seed
```

### Can't access dashboard
- Check hosting is deployed: `npm run firebase:deploy:hosting`
- Verify URL: https://program-info-extractor.web.app
- Check browser console for errors

### Data not updating
- Run seed script: `npm run seed`
- Check Firestore rules are deployed
- Verify Firestore is enabled

## 📞 Support Links

- **Firebase Console:** https://console.firebase.google.com/project/program-info-extractor
- **Firestore Data:** https://console.firebase.google.com/project/program-info-extractor/firestore
- **Hosting:** https://console.firebase.google.com/project/program-info-extractor/hosting

---

## ✅ Ready to Deploy!

1. ✅ Firestore rules deployed
2. ⏳ Seed mock data: `npm run seed`
3. ⏳ Deploy hosting: `npm run firebase:deploy:hosting`
4. ✅ Access dashboard at: **https://program-info-extractor.web.app**

**No login credentials needed - it's a public read-only dashboard!** 🎉

