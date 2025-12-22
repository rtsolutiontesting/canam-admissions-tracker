/**
 * Configuration management
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const config = {
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
    serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service-account-key.json',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './firebase-service-account-key.json',
  },
  ai: {
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    model: 'gemini-pro', // or 'gemini-pro-vision' if needed
  },
  extraction: {
    maxRetries: 3,
    retryDelayMs: 2000,
    requestTimeoutMs: 30000,
    maxFieldLength: 500,
  },
  rateLimiting: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
};

// Validate required configuration
const requiredEnvVars = [
  'GOOGLE_SHEETS_SPREADSHEET_ID',
  'GOOGLE_SERVICE_ACCOUNT_KEY_PATH',
  'FIREBASE_PROJECT_ID',
  'GOOGLE_AI_API_KEY',
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
}

