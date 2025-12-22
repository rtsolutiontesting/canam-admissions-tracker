/**
 * Comparison service - detects changes and determines formatting
 * CRITICAL: Properly identifies CHANGED, NEW, and NOT_FOUND scenarios
 */

import {
  ExtractedData,
  ComparisonResult,
  FieldChange,
  ProgramRow,
} from '../types';

export class ComparisonService {
  /**
   * Compare extracted data with existing row data
   * Logic:
   * 1. If value unchanged: no formatting
   * 2. If value changed: BLUE + BOLD
   * 3. If value is newly discovered (was empty): GREEN
   * 4. If value is now NOT_FOUND but previously existed: RED
   */
  compare(
    extractedData: ExtractedData,
    existingRow: ProgramRow,
    lastSnapshot: ExtractedData | null
  ): ComparisonResult {
    const changes: FieldChange[] = [];
    const fields: (keyof ExtractedData)[] = [
      'intakeOffered',
      'intakeStatus',
      'applicationDeadline',
      'casDeadline',
      'i20Deadline',
      'admissionAlerts',
    ];

    for (const field of fields) {
      const newValue = extractedData[field] || '';
      const existingValue = (existingRow[field as keyof ProgramRow] as string) || '';
      
      // Use existing row value if available, otherwise use snapshot
      const oldValue = existingValue || (lastSnapshot?.[field] as string) || '';

      // Normalize values for comparison (trim whitespace, handle empty strings)
      const normalizedNew = newValue.trim();
      const normalizedOld = oldValue.trim();

      // Skip if values are identical
      if (normalizedNew === normalizedOld) {
        continue;
      }

      // Determine change type
      let changeType: 'CHANGED' | 'NEW' | 'NOT_FOUND';

      if (normalizedNew === 'NOT_FOUND' && normalizedOld && normalizedOld !== 'NOT_FOUND') {
        // Value was previously found but is now NOT_FOUND
        changeType = 'NOT_FOUND';
      } else if (!normalizedOld || normalizedOld === 'NOT_FOUND' || normalizedOld === '') {
        // Value is newly discovered (old value was empty or NOT_FOUND)
        if (normalizedNew && normalizedNew !== 'NOT_FOUND') {
          changeType = 'NEW';
        } else {
          // Both are NOT_FOUND or empty, skip
          continue;
        }
      } else {
        // Value has changed from one non-empty value to another
        changeType = 'CHANGED';
      }

      changes.push({
        field,
        oldValue: normalizedOld || 'NOT_FOUND',
        newValue: normalizedNew || 'NOT_FOUND',
        changeType,
      });
    }

    return {
      hasChanges: changes.length > 0,
      changes,
      newData: extractedData,
      oldData: lastSnapshot,
    };
  }

  /**
   * Get formatting for a changed field
   * - CHANGED: Blue + Bold
   * - NEW: Green + Bold
   * - NOT_FOUND: Red + Bold
   */
  getFieldFormat(changeType: 'CHANGED' | 'NEW' | 'NOT_FOUND'): {
    textColor: { red: number; green: number; blue: number };
    bold: boolean;
  } {
    switch (changeType) {
      case 'CHANGED':
        // Blue for changed values
        return {
          textColor: { red: 0.2, green: 0.4, blue: 1.0 }, // Blue
          bold: true,
        };
      case 'NEW':
        // Green for newly discovered values
        return {
          textColor: { red: 0.0, green: 0.7, blue: 0.0 }, // Green
          bold: true,
        };
      case 'NOT_FOUND':
        // Red for values that previously existed but are now NOT_FOUND
        return {
          textColor: { red: 1.0, green: 0.0, blue: 0.0 }, // Red
          bold: true,
        };
      default:
        // Default (black, not bold) - should not be used
        return {
          textColor: { red: 0.0, green: 0.0, blue: 0.0 },
          bold: false,
        };
    }
  }
}
