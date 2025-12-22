# PowerShell script to set up a new Firebase project for CANAM IAPPLY

Write-Host "🚀 Setting up new Firebase project for CANAM IAPPLY..." -ForegroundColor Green

# Step 1: Login to Firebase
Write-Host "`nStep 1: Logging in to Firebase..." -ForegroundColor Yellow
firebase login

# Step 2: Create new project
Write-Host "`nStep 2: Creating new Firebase project..." -ForegroundColor Yellow
$PROJECT_ID = Read-Host "Enter new project ID (e.g., canam-admissions-tracker-new)"
firebase projects:create $PROJECT_ID

# Step 3: Use the new project
Write-Host "`nStep 3: Switching to new project..." -ForegroundColor Yellow
firebase use $PROJECT_ID

# Step 4: Initialize Firestore
Write-Host "`nStep 4: Initializing Firestore..." -ForegroundColor Yellow
Write-Host "Please select 'Use an existing project' and choose the project you just created" -ForegroundColor Cyan
firebase init firestore --project $PROJECT_ID

# Step 5: Deploy Firestore rules
Write-Host "`nStep 5: Deploying Firestore rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules --project $PROJECT_ID

# Step 6: Deploy hosting
Write-Host "`nStep 6: Deploying hosting..." -ForegroundColor Yellow
firebase deploy --only hosting --project $PROJECT_ID

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Enable required APIs in Google Cloud Console" -ForegroundColor White
Write-Host "2. Configure Authentication in Firebase Console" -ForegroundColor White
Write-Host "3. Update Firebase config in public/*.html files" -ForegroundColor White
Write-Host "4. Test the application" -ForegroundColor White

