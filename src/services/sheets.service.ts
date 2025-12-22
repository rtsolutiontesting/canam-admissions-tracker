/**
 * Google Sheets API service for reading and updating sheets
 * CRITICAL: Updates the SAME input sheet, does NOT create new sheets
 */

import { google } from 'googleapis';
import * as path from 'path';
import { config } from '../config';
import {
  ProgramRow,
  ComparisonResult,
  ExtractionStatus,
  CellFormat,
} from '../types';
import { ComparisonService } from './comparison.service';

export class SheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private comparisonService: ComparisonService;
  private columnMap: Map<string, string> = new Map(); // Dynamic column mapping

  constructor() {
    this.spreadsheetId = config.googleSheets.spreadsheetId;
    this.comparisonService = new ComparisonService();
    this.initializeSheets();
  }

  private async initializeSheets(): Promise<void> {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: path.resolve(config.googleSheets.serviceAccountKeyPath),
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
        ],
      });

      const authClient = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient as any });

      // Build dynamic column map from headers
      await this.buildColumnMap();
      
      // Ensure output columns exist
      await this.ensureColumnsExist();
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Build column map from sheet headers (row 1)
   */
  private async buildColumnMap(): Promise<void> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '1:1', // First row only
      });

      const headers = response.data.values?.[0] || [];
      
      // Map headers to column letters
      headers.forEach((header: string, index: number) => {
        const columnLetter = this.indexToColumnLetter(index);
        const normalizedHeader = this.normalizeHeader(header);
        this.columnMap.set(normalizedHeader, columnLetter);
      });

      console.log('Column map built:', Array.from(this.columnMap.entries()));
    } catch (error) {
      console.error('Error building column map:', error);
      // Fallback to default mapping if needed
      this.setDefaultColumnMap();
    }
  }

  /**
   * Normalize header name for matching
   */
  private normalizeHeader(header: string): string {
    return header
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  }

  /**
   * Convert column index (0-based) to letter (A, B, C, ...)
   */
  private indexToColumnLetter(index: number): string {
    let result = '';
    let num = index;
    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }

  /**
   * Convert column letter to index
   */
  private columnLetterToIndex(letter: string): number {
    let result = 0;
    for (let i = 0; i < letter.length; i++) {
      result = result * 26 + (letter.charCodeAt(i) - 64);
    }
    return result - 1;
  }

  /**
   * Fallback default column mapping
   */
  private setDefaultColumnMap(): void {
    const defaults: Record<string, string> = {
      sr: 'A',
      universityname: 'B',
      country: 'C',
      location: 'D',
      programname: 'E',
      admissionspageurl: 'F',
      admissionsemail: 'G',
      notes: 'H',
      intakeoffered: 'I',
      intakestatus: 'J',
      applicationdeadline: 'K',
      casdeadline: 'L',
      i20deadline: 'M',
      admissionalerts: 'N',
      extractionstatus: 'O',
      errormessage: 'P',
      lastchecked: 'Q',
    };

    Object.entries(defaults).forEach(([key, value]) => {
      this.columnMap.set(key, value);
    });
  }

  /**
   * Get column letter for a field name
   */
  private getColumnLetter(fieldName: string): string | null {
    const normalized = this.normalizeHeader(fieldName);
    return this.columnMap.get(normalized) || null;
  }

  /**
   * Ensure all required columns exist in the sheet
   */
  private async ensureColumnsExist(): Promise<void> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: '1:1',
      });

      const headers = response.data.values?.[0] || [];
      const requiredHeaders = [
        'intakeOffered',
        'intakeStatus',
        'applicationDeadline',
        'CAS deadline',
        'I-20 deadline',
        'admissionAlerts',
        'extractionStatus',
        'errorMessage',
        'lastChecked',
      ];

      const missingHeaders: string[] = [];
      for (const header of requiredHeaders) {
        const normalized = this.normalizeHeader(header);
        const exists = Array.from(this.columnMap.keys()).some(
          (key) => key === normalized
        );
        if (!exists) {
          missingHeaders.push(header);
        }
      }

      if (missingHeaders.length > 0) {
        // Add missing headers to the end
        const lastColIndex = headers.length;
        const startCol = this.indexToColumnLetter(lastColIndex);
        const endCol = this.indexToColumnLetter(lastColIndex + missingHeaders.length - 1);

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${startCol}1:${endCol}1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [missingHeaders],
          },
        });

        // Rebuild column map after adding headers
        await this.buildColumnMap();

        console.log(`Added missing headers: ${missingHeaders.join(', ')}`);
      }
    } catch (error) {
      console.error('Error ensuring columns exist:', error);
      // Continue anyway - columns might already exist
    }
  }

  /**
   * Read all program rows from the sheet
   */
  async readProgramRows(): Promise<ProgramRow[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A2:Z1000', // Read from row 2 onwards (row 1 is headers)
      });

      const rows = response.data.values || [];
      const programRows: ProgramRow[] = [];

      // Get column indices from map
      const getValue = (row: any[], fieldName: string): string => {
        const colLetter = this.getColumnLetter(fieldName);
        if (!colLetter) return '';
        const colIndex = this.columnLetterToIndex(colLetter);
        return row[colIndex] || '';
      };

      for (const row of rows) {
        if (!row[0] && !row[1]) continue; // Skip empty rows

        programRows.push({
          sr: getValue(row, 'sr') || row[0] || '',
          universityName: getValue(row, 'universityName') || row[1] || '',
          country: getValue(row, 'country') || row[2] || '',
          location: getValue(row, 'location') || row[3] || '',
          programName: getValue(row, 'programName') || row[4] || '',
          admissionsPageUrl: getValue(row, 'admissionsPageUrl') || row[5] || '',
          admissionsEmail: getValue(row, 'admissionsEmail') || row[6] || '',
          notes: getValue(row, 'notes') || row[7] || '',
          intakeOffered: getValue(row, 'intakeOffered') || '',
          intakeStatus: getValue(row, 'intakeStatus') || '',
          applicationDeadline: getValue(row, 'applicationDeadline') || '',
          casDeadline: getValue(row, 'CAS deadline') || '',
          i20Deadline: getValue(row, 'I-20 deadline') || '',
          admissionAlerts: getValue(row, 'admissionAlerts') || '',
          extractionStatus: getValue(row, 'extractionStatus') || '',
          errorMessage: getValue(row, 'errorMessage') || '',
          lastChecked: getValue(row, 'lastChecked') || '',
        });
      }

      return programRows;
    } catch (error) {
      console.error('Error reading program rows:', error);
      throw error;
    }
  }

  /**
   * Update a row with extracted data and formatting
   * CRITICAL: Updates the SAME sheet, applies visual highlighting
   * @param rowIndex - 0-based index (0 = row 2 in sheet, since row 1 is header)
   */
  async updateRow(
    rowIndex: number, // 0-based index (0 = first data row = row 2 in sheet)
    extractedData: any,
    comparisonResult: ComparisonResult,
    status: ExtractionStatus,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Convert 0-based index to 1-based sheet row (row 1 is header, so add 2)
      const actualRowIndex = rowIndex + 2;
      
      // Prepare value updates
      const valueUpdates: any[] = [];
      const formatRequests: any[] = [];

      // Fields to update
      const fields = [
        { key: 'intakeOffered', sheetHeader: 'intakeOffered' },
        { key: 'intakeStatus', sheetHeader: 'intakeStatus' },
        { key: 'applicationDeadline', sheetHeader: 'applicationDeadline' },
        { key: 'casDeadline', sheetHeader: 'CAS deadline' },
        { key: 'i20Deadline', sheetHeader: 'I-20 deadline' },
        { key: 'admissionAlerts', sheetHeader: 'admissionAlerts' },
      ];

      for (const field of fields) {
        const columnLetter = this.getColumnLetter(field.sheetHeader);
        if (!columnLetter) continue;

        const newValue = extractedData[field.key] || '';
        const change = comparisonResult.changes.find((c) => c.field === field.key);

        // Update value
        valueUpdates.push({
          range: `${columnLetter}${actualRowIndex}`,
          values: [[newValue]],
        });

        // Apply formatting based on change type
        if (change) {
          const format = this.comparisonService.getFieldFormat(change.changeType);
          const colIndex = this.columnLetterToIndex(columnLetter);

          formatRequests.push({
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: actualRowIndex - 1, // Convert to 0-based
                endRowIndex: actualRowIndex,
                startColumnIndex: colIndex,
                endColumnIndex: colIndex + 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    foregroundColor: {
                      red: format.textColor.red,
                      green: format.textColor.green,
                      blue: format.textColor.blue,
                    },
                    bold: format.bold,
                  },
                },
              },
              fields: 'userEnteredFormat.textFormat',
            },
          });
        } else {
          // No change - clear formatting (reset to default)
          const colIndex = this.columnLetterToIndex(columnLetter);
          formatRequests.push({
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: actualRowIndex - 1,
                endRowIndex: actualRowIndex,
                startColumnIndex: colIndex,
                endColumnIndex: colIndex + 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    foregroundColor: {
                      red: 0,
                      green: 0,
                      blue: 0,
                    },
                    bold: false,
                  },
                },
              },
              fields: 'userEnteredFormat.textFormat',
            },
          });
        }
      }

      // Update status columns
      const statusCol = this.getColumnLetter('extractionStatus');
      if (statusCol) {
        valueUpdates.push({
          range: `${statusCol}${actualRowIndex}`,
          values: [[status]],
        });
      }

      if (errorMessage) {
        const errorCol = this.getColumnLetter('errorMessage');
        if (errorCol) {
          valueUpdates.push({
            range: `${errorCol}${actualRowIndex}`,
            values: [[errorMessage.substring(0, 200)]],
          });
        }
      }

      const lastCheckedCol = this.getColumnLetter('lastChecked');
      if (lastCheckedCol) {
        valueUpdates.push({
          range: `${lastCheckedCol}${actualRowIndex}`,
          values: [[new Date().toISOString()]],
        });
      }

      // Execute value updates in batch
      if (valueUpdates.length > 0) {
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: valueUpdates,
          },
        });
      }

      // Execute format updates in batch
      if (formatRequests.length > 0) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: formatRequests,
          },
        });
      }

      console.log(`✓ Updated row ${actualRowIndex} with ${formatRequests.length} format changes`);
    } catch (error) {
      console.error(`Error updating row ${rowIndex}:`, error);
      throw error;
    }
  }
}
