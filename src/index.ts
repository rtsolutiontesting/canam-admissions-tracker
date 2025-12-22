/**
 * Main orchestration service
 * Entry point for the University Admissions Tracker
 * CRITICAL: Updates the SAME input sheet, does NOT create new sheets
 */

import { FirebaseService } from './services/firebase.service';
import { SheetsService } from './services/sheets.service';
import { ExtractionService } from './services/extraction.service';
import { ComparisonService } from './services/comparison.service';
import { ExtractionStatus } from './types';

class AdmissionsTracker {
  private firebaseService: FirebaseService;
  private sheetsService: SheetsService;
  private extractionService: ExtractionService;
  private comparisonService: ComparisonService;

  constructor() {
    this.firebaseService = new FirebaseService();
    this.sheetsService = new SheetsService();
    this.extractionService = new ExtractionService();
    this.comparisonService = new ComparisonService();
  }

  /**
   * Main execution flow
   * CRITICAL: Updates the SAME input Google Sheet
   */
  async run(): Promise<void> {
    console.log('Starting University Admissions Tracker...');
    console.log('CRITICAL: Updating the SAME input sheet, not creating new sheets');
    const startTime = Date.now();

    // Create execution log
    const executionId = await this.firebaseService.createExecutionLog();

    try {
      // Read all program rows from sheet
      console.log('Reading program rows from Google Sheet...');
      const programRows = await this.sheetsService.readProgramRows();
      console.log(`Found ${programRows.length} programs to process`);

      if (programRows.length === 0) {
        console.log('No programs found in sheet. Exiting.');
        await this.firebaseService.updateExecutionLog(executionId, {
          endTime: new Date(),
          totalPrograms: 0,
          successful: 0,
          failed: 0,
          errors: [],
        });
        return;
      }

      // Update execution log
      await this.firebaseService.updateExecutionLog(executionId, {
        totalPrograms: programRows.length,
      });

      let successful = 0;
      let failed = 0;
      const errors: Array<{ programId: string; error: string }> = [];

      // Process each program
      // Note: Row index in sheet is 1-based, row 1 is header, data starts at row 2
      for (let i = 0; i < programRows.length; i++) {
        const row = programRows[i];
        const sheetRowIndex = i + 2; // Row 1 is header, so data starts at row 2

        if (!row.admissionsPageUrl || !row.admissionsPageUrl.trim()) {
          console.log(`Skipping row ${sheetRowIndex}: No URL provided`);
          continue;
        }

        const programId = `${row.universityName}_${row.programName}`.replace(/[^a-zA-Z0-9_]/g, '_');

        try {
          console.log(`Processing [${i + 1}/${programRows.length}]: ${programId} (Row ${sheetRowIndex})`);

          // Check rate limit
          const rateLimit = await this.firebaseService.checkRateLimit();
          if (!rateLimit.allowed) {
            const waitTime = rateLimit.resetAt
              ? Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
              : 60;
            console.log(`Rate limit reached. Waiting ${waitTime} seconds...`);
            await this.sleep(waitTime * 1000);
          }

          // Get last snapshot from Firebase
          const lastSnapshot = await this.firebaseService.getProgramSnapshot(programId);

          // Extract data from URL
          const extractionResult = await this.extractionService.extractFromUrl(
            row.admissionsPageUrl,
            row.programName,
            row.universityName,
            row.country
          );

          // Compare with existing data (from sheet and/or snapshot)
          const comparisonResult = this.comparisonService.compare(
            extractionResult.data,
            row,
            lastSnapshot?.lastSnapshot || null
          );

          // Update the SAME sheet with new data and formatting
          await this.sheetsService.updateRow(
            sheetRowIndex - 1, // Pass 0-based index (service will convert to 1-based)
            extractionResult.data,
            comparisonResult,
            extractionResult.status,
            extractionResult.errorMessage
          );

          // Save snapshot to Firebase for future comparisons
          await this.firebaseService.saveProgramSnapshot(
            programId,
            extractionResult.data,
            extractionResult.status,
            extractionResult.errorMessage
          );

          if (extractionResult.status === ExtractionStatus.SUCCESS) {
            successful++;
            console.log(`✓ Success: ${programId} - ${comparisonResult.changes.length} changes detected`);
          } else {
            failed++;
            console.log(`✗ Failed: ${programId} - ${extractionResult.errorMessage}`);
            errors.push({
              programId,
              error: extractionResult.errorMessage || 'Unknown error',
            });
          }

          // Small delay between requests to be respectful
          await this.sleep(1000);
        } catch (error: any) {
          failed++;
          const errorMsg = (error.message || String(error)).substring(0, 200);
          console.error(`Error processing ${programId} (Row ${sheetRowIndex}):`, errorMsg);
          errors.push({ programId, error: errorMsg });

          // Try to update sheet with error status
          try {
            const notFoundData = {
              intakeOffered: 'NOT_FOUND',
              intakeStatus: 'NOT_FOUND' as const,
              applicationDeadline: 'NOT_FOUND',
              casDeadline: 'NOT_FOUND',
              i20Deadline: 'NOT_FOUND',
              admissionAlerts: 'NOT_FOUND',
            };

            await this.sheetsService.updateRow(
              sheetRowIndex - 1, // 0-based index
              notFoundData,
              { 
                hasChanges: false, 
                changes: [], 
                newData: notFoundData, 
                oldData: null 
              },
              ExtractionStatus.FETCH_ERROR,
              errorMsg
            );
          } catch (updateError) {
            console.error('Failed to update sheet with error status:', updateError);
          }
        }
      }

      // Update execution log
      await this.firebaseService.updateExecutionLog(executionId, {
        endTime: new Date(),
        successful,
        failed,
        errors,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n=== Execution Summary ===');
      console.log(`Total programs: ${programRows.length}`);
      console.log(`Successful: ${successful}`);
      console.log(`Failed: ${failed}`);
      console.log(`Duration: ${duration}s`);
      console.log('========================\n');
    } catch (error) {
      console.error('Fatal error in main execution:', error);
      try {
        await this.firebaseService.updateExecutionLog(executionId, {
          endTime: new Date(),
          errors: [{ programId: 'SYSTEM', error: String(error) }],
        });
      } catch (logError) {
        console.error('Failed to update execution log:', logError);
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run if executed directly
if (require.main === module) {
  const tracker = new AdmissionsTracker();
  tracker
    .run()
    .then(() => {
      console.log('Execution completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Execution failed:', error);
      process.exit(1);
    });
}

export { AdmissionsTracker };
