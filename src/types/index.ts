/**
 * Core type definitions for the University Admissions Tracker
 */

export interface ProgramRow {
  sr: string;
  universityName: string;
  country: string;
  location: string;
  programName: string;
  admissionsPageUrl: string;
  admissionsEmail: string;
  notes: string;
  // Output fields (may be empty initially)
  intakeOffered?: string;
  intakeStatus?: string;
  applicationDeadline?: string;
  casDeadline?: string;
  i20Deadline?: string;
  admissionAlerts?: string;
  extractionStatus?: string;
  errorMessage?: string;
  lastChecked?: string;
}

export interface ExtractedData {
  intakeOffered: string;
  intakeStatus: 'open' | 'closed' | 'waitlist' | 'NOT_FOUND';
  applicationDeadline: string;
  casDeadline: string;
  i20Deadline: string;
  admissionAlerts: string;
}

export interface ComparisonResult {
  hasChanges: boolean;
  changes: FieldChange[];
  newData: ExtractedData;
  oldData: ExtractedData | null;
}

export interface FieldChange {
  field: keyof ExtractedData;
  oldValue: string;
  newValue: string;
  changeType: 'CHANGED' | 'NEW' | 'NOT_FOUND';
}

export interface ProgramSnapshot {
  programId: string;
  lastSnapshot: ExtractedData;
  lastUpdated: Date;
  extractionHistory: ExtractionHistoryEntry[];
}

export interface ExtractionHistoryEntry {
  timestamp: Date;
  status: 'SUCCESS' | 'FETCH_ERROR' | 'NOT_FOUND';
  data: ExtractedData | null;
  errorMessage?: string;
}

export interface ExecutionLog {
  executionId: string;
  startTime: Date;
  endTime?: Date;
  totalPrograms: number;
  successful: number;
  failed: number;
  errors: Array<{ programId: string; error: string }>;
}

export interface SheetUpdate {
  rowIndex: number;
  updates: Array<{
    column: string;
    value: string;
    format?: CellFormat;
  }>;
}

export interface CellFormat {
  textColor?: { red: number; green: number; blue: number };
  bold?: boolean;
}

export enum ExtractionStatus {
  SUCCESS = 'SUCCESS',
  FETCH_ERROR = 'FETCH_ERROR',
  NOT_FOUND = 'NOT_FOUND'
}

