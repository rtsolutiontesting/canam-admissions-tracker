# Comprehensive System Backup Script
# Creates a complete backup of the entire system at commit cdd051a

$ErrorActionPreference = "Stop"
$backupDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$commitHash = "cdd051a"
$backupName = "canam-admissions-tracker-backup-$commitHash-$backupDate"
$backupDir = ".\backups"
$zipFile = "$backupDir\$backupName.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating System Backup" -ForegroundColor Cyan
Write-Host "Commit: $commitHash" -ForegroundColor Yellow
Write-Host "Date: $backupDate" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Create backups directory
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backups directory" -ForegroundColor Green
}

# Save current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Checkout the specific commit
Write-Host "Checking out commit $commitHash..." -ForegroundColor Yellow
git checkout $commitHash
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to checkout commit" -ForegroundColor Red
    exit 1
}

# Create temporary directory for backup
$tempBackupDir = ".\temp-backup-$backupDate"
if (Test-Path $tempBackupDir) {
    Remove-Item -Recurse -Force $tempBackupDir
}
New-Item -ItemType Directory -Path $tempBackupDir | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy all important files and directories
$itemsToBackup = @(
    "public",
    "functions",
    "src",
    "package.json",
    "package-lock.json",
    "firebase.json",
    "firestore.rules",
    "firestore.indexes.json",
    "tsconfig.json",
    "*.md",
    ".git"
)

foreach ($item in $itemsToBackup) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempBackupDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Copied: $item" -ForegroundColor Gray
    }
}

# Create backup info file
$backupInfo = @"
CANAM ADMISSIONS TRACKER - SYSTEM BACKUP
========================================

Backup Date: $backupDate
Commit Hash: $commitHash
Commit Message: Complete AI usage tracking and fallback system

SYSTEM INFORMATION:
- Platform: Cloudflare Pages
- Build Output: public/
- Functions: functions/
- Database: Firebase Firestore
- Authentication: Firebase Auth

BACKUP CONTENTS:
- All source code (public/, functions/, src/)
- Configuration files (package.json, firebase.json, etc.)
- Documentation (*.md files)
- Git history (.git/)

RESTORATION INSTRUCTIONS:
1. Extract this zip file
2. Run: npm install
3. Configure Firebase credentials
4. Deploy to Cloudflare Pages

IMPORTANT FILES:
- public/index.html (Main application)
- functions/api/extract.js (AI extraction API)
- functions/api/proxy.js (CORS proxy)
- firebase.json (Firebase configuration)

DATABASE BACKUP:
- Firestore data should be exported separately via Firebase Console
- This backup contains schema (firestore.rules, firestore.indexes.json)

"@

$backupInfo | Out-File -FilePath "$tempBackupDir\BACKUP_INFO.txt" -Encoding UTF8

# Create git info file
git log -1 --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nMessage: %s" > "$tempBackupDir\GIT_INFO.txt"

# Create zip file
Write-Host "Creating zip archive..." -ForegroundColor Yellow
Compress-Archive -Path "$tempBackupDir\*" -DestinationPath $zipFile -Force

# Cleanup temp directory
Remove-Item -Recurse -Force $tempBackupDir

# Get file size
$fileSize = (Get-Item $zipFile).Length / 1MB
Write-Host "Backup created: $zipFile" -ForegroundColor Green
Write-Host "Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green

# Return to original branch
Write-Host "Returning to branch: $currentBranch" -ForegroundColor Yellow
git checkout $currentBranch

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "Location: $zipFile" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

