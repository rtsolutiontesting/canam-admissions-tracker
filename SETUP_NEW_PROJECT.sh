#!/bin/bash
# Script to set up a new Firebase project for CANAM IAPPLY

echo "🚀 Setting up new Firebase project for CANAM IAPPLY..."

# Step 1: Login to Firebase
echo "Step 1: Logging in to Firebase..."
firebase login

# Step 2: Create new project
echo "Step 2: Creating new Firebase project..."
read -p "Enter new project ID (e.g., canam-admissions-tracker-new): " PROJECT_ID
firebase projects:create $PROJECT_ID

# Step 3: Use the new project
echo "Step 3: Switching to new project..."
firebase use $PROJECT_ID

# Step 4: Initialize Firestore
echo "Step 4: Initializing Firestore..."
firebase init firestore --project $PROJECT_ID

# Step 5: Deploy Firestore rules
echo "Step 5: Deploying Firestore rules..."
firebase deploy --only firestore:rules --project $PROJECT_ID

# Step 6: Deploy hosting
echo "Step 6: Deploying hosting..."
firebase deploy --only hosting --project $PROJECT_ID

echo "✅ Setup complete!"
echo "📝 Next steps:"
echo "1. Enable required APIs in Google Cloud Console"
echo "2. Configure Authentication in Firebase Console"
echo "3. Update Firebase config in public/*.html files"
echo "4. Test the application"

