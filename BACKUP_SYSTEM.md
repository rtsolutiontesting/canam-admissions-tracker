# System Backup & Recovery

## 📦 Backup Created

**Commit:** `cdd051a`  
**Date:** 2025-12-23  
**Location:** `backups/canam-admissions-tracker-backup-cdd051a-2025-12-23_16-26-38.zip`  
**Size:** 25.06 MB

## 📋 Backup Contents

The backup includes:
- ✅ All source code (`public/`, `functions/`, `src/`)
- ✅ Configuration files (`package.json`, `firebase.json`, `tsconfig.json`)
- ✅ Firestore rules and indexes (`firestore.rules`, `firestore.indexes.json`)
- ✅ All documentation (`*.md` files)
- ✅ Complete Git history (`.git/`)

## 🔄 Automatic Backups

### Manual Backup
Run the backup script anytime:
```powershell
powershell -ExecutionPolicy Bypass -File .\create-backup.ps1
```

### Automatic Daily Backup
Set up Windows Task Scheduler:

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Canam Admissions Tracker Backup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
6. Program: `powershell.exe`
7. Arguments: `-ExecutionPolicy Bypass -File "D:\Program info extracrtor\auto-backup.ps1"`
8. Start in: `D:\Program info extracrtor`

### Automatic Backup on Git Push
Add to `.git/hooks/post-commit`:
```bash
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -File "D:\Program info extracrtor\auto-backup.ps1"
```

## 🔧 Restoration Instructions

### Restore from Backup

1. **Extract the zip file**
   ```powershell
   Expand-Archive -Path "backups\canam-admissions-tracker-backup-cdd051a-*.zip" -DestinationPath "restored-system"
   ```

2. **Install Dependencies**
   ```powershell
   cd restored-system
   npm install
   ```

3. **Configure Firebase**
   - Update `firebase.json` with your project credentials
   - Set up Firestore database in Firebase Console

4. **Deploy to Cloudflare Pages**
   ```powershell
   git remote add origin <your-repo-url>
   git push origin main
   ```

### Restore Specific Commit

```powershell
git checkout cdd051a
# Make changes or create new branch
git checkout -b restore-cdd051a
```

## 📁 Backup Storage

- **Location:** `backups/` directory
- **Naming:** `canam-admissions-tracker-backup-{commit}-{date}.zip`
- **Auto-backups:** `auto-backup-{date}.zip`
- **Retention:** Last 10 auto-backups kept automatically

## 🗄️ Database Backup

**Important:** Firestore data is NOT included in code backups.

To backup Firestore data:
1. Go to Firebase Console
2. Firestore Database → Export
3. Download the export file separately

To restore Firestore data:
1. Firebase Console → Firestore Database → Import
2. Upload the exported file

## 🔐 Security Notes

- Backup files contain code but NOT sensitive credentials
- API keys are stored in environment variables (not in code)
- Firebase credentials should be configured after restoration
- Never commit `.env` files or API keys to Git

## 📊 Backup Status

- ✅ Code backup: Complete
- ✅ Git history: Complete
- ✅ Configuration: Complete
- ⚠️ Database: Manual export required
- ⚠️ Environment variables: Manual setup required

## 🚀 Quick Commands

```powershell
# Create backup of current state
.\create-backup.ps1

# Create automatic backup
.\auto-backup.ps1

# List all backups
Get-ChildItem backups\*.zip | Sort-Object LastWriteTime -Descending

# Restore specific commit
git checkout cdd051a
```

