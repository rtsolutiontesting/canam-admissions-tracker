# Automatic Backup Script
# Run this script periodically to create backups

$ErrorActionPreference = "Stop"
$backupDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = ".\backups"
$zipFile = "$backupDir\auto-backup-$backupDate.zip"

Write-Host "Creating automatic backup..." -ForegroundColor Cyan

# Create backups directory
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Get current commit
$currentCommit = git rev-parse --short HEAD
$currentBranch = git rev-parse --abbrev-ref HEAD

# Create temporary directory
$tempBackupDir = ".\temp-auto-backup-$backupDate"
if (Test-Path $tempBackupDir) {
    Remove-Item -Recurse -Force $tempBackupDir
}
New-Item -ItemType Directory -Path $tempBackupDir | Out-Null

# Copy important files
$itemsToBackup = @(
    "public",
    "functions",
    "src",
    "package.json",
    "package-lock.json",
    "firebase.json",
    "firestore.rules",
    "firestore.indexes.json",
    "tsconfig.json"
)

foreach ($item in $itemsToBackup) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempBackupDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Create backup info
$backupInfo = @"
AUTOMATIC BACKUP
================
Date: $backupDate
Commit: $currentCommit
Branch: $currentBranch
"@

$backupInfo | Out-File -FilePath "$tempBackupDir\BACKUP_INFO.txt" -Encoding UTF8

# Create zip
Compress-Archive -Path "$tempBackupDir\*" -DestinationPath $zipFile -Force

# Cleanup
Remove-Item -Recurse -Force $tempBackupDir

# Keep only last 10 backups
$backups = Get-ChildItem -Path $backupDir -Filter "auto-backup-*.zip" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 10) {
    $backups | Select-Object -Skip 10 | Remove-Item -Force
    Write-Host "Removed old backups (kept last 10)" -ForegroundColor Yellow
}

Write-Host "Backup created: $zipFile" -ForegroundColor Green

