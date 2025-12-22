# Deploy Cloud Functions for Real Sheet Execution

## Step 1: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

## Step 2: Set Environment Variables

Set these in Firebase Console or via CLI:

```bash
# Set Google AI API Key
firebase functions:config:set google.ai_api_key="YOUR_GOOGLE_AI_API_KEY"

# Set Google Service Account Key (as JSON string)
firebase functions:config:set google.service_account_key='{"type":"service_account",...}'
```

Or use Firebase Console:
1. Go to: https://console.firebase.google.com/project/program-info-extractor/functions/config
2. Add environment variables

## Step 3: Deploy Functions

```bash
firebase deploy --only functions
```

## Step 4: Update Frontend Function URL

After deployment, you'll get a function URL like:
```
https://us-central1-program-info-extractor.cloudfunctions.net/runSync
```

Update `public/index.html` line with the function URL if different.

## Step 5: Test

1. Visit: https://program-info-extractor.web.app
2. Enter your Google Sheet URL
3. Click "Run Manual Sync"
4. Watch the execution stream

## Alternative: Direct Backend Integration

If Cloud Functions don't work, you can:

1. Run the backend locally:
```bash
npm start
```

2. Update frontend to call local API (for development only)

3. Or use a different hosting solution (Cloud Run, App Engine, etc.)

## Troubleshooting

### Function deployment fails
- Check Node.js version (requires 18)
- Verify all dependencies installed
- Check Firebase CLI is logged in

### Function returns 500 error
- Check function logs: `firebase functions:log`
- Verify environment variables are set
- Check service account has proper permissions

### CORS errors
- Functions already have CORS enabled
- Check browser console for specific errors

### Sheet access denied
- Share Google Sheet with service account email
- Verify service account has Editor permissions
- Check sheet URL is correct

