/**
 * Firebase Cloud Functions for University Admissions Tracker
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Import the tracker service
const { AdmissionsTracker } = require('./tracker');

/**
 * HTTP Cloud Function to run manual sync
 */
exports.runSync = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { sheetUrl } = req.body || req.query;
    
    if (!sheetUrl) {
      return res.status(400).json({ 
        error: 'Sheet URL is required',
        message: 'Please provide a Google Sheets URL'
      });
    }

    // Extract spreadsheet ID from URL
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ 
        error: 'Invalid Google Sheets URL',
        message: 'Could not extract spreadsheet ID from URL'
      });
    }

    // Run the sync process
    const tracker = new AdmissionsTracker(spreadsheetId);
    const result = await tracker.run();

    res.status(200).json({
      success: true,
      message: 'Sync completed successfully',
      result: result
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Sync failed. Check logs for details.'
    });
  }
});

/**
 * Extract spreadsheet ID from Google Sheets URL
 */
function extractSpreadsheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

