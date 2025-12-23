/**
 * Admissions Tracker Service for Cloud Functions
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class AdmissionsTracker {
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.db = admin.firestore();
    this.aiClient = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }

  async run() {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    try {
      // Initialize Google Sheets
      const doc = await this.initGoogleSheets();
      
      // Read program rows
      const rows = await this.readProgramRows(doc);
      
      let successful = 0;
      let failed = 0;
      const errors = [];

      // Process each program
      for (const row of rows) {
        try {
          await this.processProgram(row);
          successful++;
        } catch (error) {
          failed++;
          errors.push({
            programId: `${row.universityName}_${row.programName}`,
            error: error.message
          });
        }
      }

      const endTime = new Date();
      
      // Save execution log
      await this.db.collection('executionLogs').doc(executionId).set({
        executionId,
        startTime: admin.firestore.Timestamp.fromDate(startTime),
        endTime: admin.firestore.Timestamp.fromDate(endTime),
        totalPrograms: rows.length,
        successful,
        failed,
        errors
      });

      return {
        executionId,
        totalPrograms: rows.length,
        successful,
        failed,
        errors
      };

    } catch (error) {
      throw error;
    }
  }

  async initGoogleSheets() {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const jwt = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(this.spreadsheetId, jwt);
    await doc.loadInfo();
    return doc;
  }

  async readProgramRows(doc) {
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      sr: row.get('Sr') || '',
      universityName: row.get('universityName') || '',
      country: row.get('country') || '',
      location: row.get('location') || '',
      programName: row.get('programName') || '',
      admissionsPageUrl: row.get('admissionsPageUrl') || '',
      admissionsEmail: row.get('admissionsEmail') || '',
      notes: row.get('notes') || '',
    })).filter(row => row.universityName && row.programName);
  }

  async processProgram(row) {
    if (!row.admissionsPageUrl) {
      throw new Error('No URL provided');
    }

    // Extract data from URL
    const extractedData = await this.extractData(row.admissionsPageUrl, row.programName, row.universityName);
    
    // Save snapshot
    const programId = `${row.universityName}_${row.programName}`.replace(/[^a-zA-Z0-9_]/g, '_');
    await this.db.collection('programSnapshots').doc(programId).set({
      programId,
      lastSnapshot: extractedData,
      lastUpdated: admin.firestore.Timestamp.now(),
    }, { merge: true });

    return extractedData;
  }

  async extractData(url, programName, universityName) {
    try {
      // Fetch URL
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const htmlContent = response.data;

      // Extract using AI
      const model = this.aiClient.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = this.buildExtractionPrompt(htmlContent, programName, universityName, url);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const extracted = JSON.parse(jsonMatch[0]);

      return {
        intakeOffered: extracted.intakeOffered || 'NOT_FOUND',
        intakeStatus: extracted.intakeStatus || 'NOT_FOUND',
        applicationDeadline: extracted.applicationDeadline || 'NOT_FOUND',
        casDeadline: extracted.casDeadline || 'NOT_FOUND',
        i20Deadline: extracted.i20Deadline || 'NOT_FOUND',
        admissionAlerts: extracted.admissionAlerts || 'NOT_FOUND',
      };

    } catch (error) {
      return {
        intakeOffered: 'NOT_FOUND',
        intakeStatus: 'NOT_FOUND',
        applicationDeadline: 'NOT_FOUND',
        casDeadline: 'NOT_FOUND',
        i20Deadline: 'NOT_FOUND',
        admissionAlerts: 'NOT_FOUND',
      };
    }
  }

  buildExtractionPrompt(htmlContent, programName, universityName, url) {
    const cleanContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 50000);

    return `Extract university admissions information. Return ONLY JSON:

{
  "intakeOffered": "string or NOT_FOUND",
  "intakeStatus": "open/closed/waitlist/NOT_FOUND",
  "applicationDeadline": "YYYY-MM-DD or NOT_FOUND",
  "casDeadline": "YYYY-MM-DD or NOT_FOUND",
  "i20Deadline": "YYYY-MM-DD or NOT_FOUND",
  "admissionAlerts": "string or NOT_FOUND"
}

University: ${universityName}
Program: ${programName}
URL: ${url}

Content: ${cleanContent}`;
  }
}

module.exports = { AdmissionsTracker };

