/**
 * HTTP Server for University Admissions Tracker
 * Run: npm run server
 */

import * as express from 'express';
import * as cors from 'cors';
import { AdmissionsTracker } from './index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'University Admissions Tracker API' });
});

// Sync endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const { sheetUrl } = req.body;

    if (!sheetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Sheet URL is required'
      });
    }

    // Extract spreadsheet ID
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google Sheets URL'
      });
    }

    const spreadsheetId = match[1];

    // Update config temporarily
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID = spreadsheetId;

    // Run tracker
    const tracker = new AdmissionsTracker();
    await tracker.run();

    res.json({
      success: true,
      message: 'Sync completed successfully'
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/sync`);
});

