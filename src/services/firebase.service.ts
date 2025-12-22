/**
 * Firebase/Firestore service for state management
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import { config } from '../config';
import {
  ProgramSnapshot,
  ExtractionHistoryEntry,
  ExecutionLog,
  ExtractedData,
  ExtractionStatus,
} from '../types';

export class FirebaseService {
  private db!: admin.firestore.Firestore;
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (this.initialized) return;

    try {
      // Check if Firebase is already initialized (e.g., in Cloud Functions)
      if (admin.apps.length > 0) {
        this.db = admin.firestore();
        this.initialized = true;
        console.log('Firebase initialized (using existing app)');
        return;
      }

      // Initialize with service account
      const serviceAccountPath = path.resolve(config.firebase.serviceAccountKeyPath);
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase.projectId,
      });

      this.db = admin.firestore();
      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  /**
   * Get last known snapshot for a program
   */
  async getProgramSnapshot(programId: string): Promise<ProgramSnapshot | null> {
    try {
      const doc = await this.db.collection('programSnapshots').doc(programId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (!data) return null;

      return {
        programId,
        lastSnapshot: data.lastSnapshot as ExtractedData,
        lastUpdated: (data.lastUpdated as admin.firestore.Timestamp).toDate(),
        extractionHistory: (data.extractionHistory || []).map((entry: any) => ({
          timestamp: entry.timestamp.toDate(),
          status: entry.status,
          data: entry.data,
          errorMessage: entry.errorMessage,
        })),
      };
    } catch (error) {
      console.error(`Error fetching snapshot for ${programId}:`, error);
      return null;
    }
  }

  /**
   * Save program snapshot
   */
  async saveProgramSnapshot(
    programId: string,
    data: ExtractedData,
    status: ExtractionStatus,
    errorMessage?: string
  ): Promise<void> {
    try {
      const snapshotRef = this.db.collection('programSnapshots').doc(programId);
      const snapshot = await snapshotRef.get();

      const historyEntry: ExtractionHistoryEntry = {
        timestamp: new Date(),
        status,
        data: status === ExtractionStatus.SUCCESS ? data : null,
        errorMessage,
      };

      if (snapshot.exists) {
        const existingData = snapshot.data();
        const history = existingData?.extractionHistory || [];
        
        // Keep last 50 entries
        const updatedHistory = [...history, historyEntry].slice(-50);

        await snapshotRef.update({
          lastSnapshot: data,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          extractionHistory: updatedHistory,
        });
      } else {
        await snapshotRef.set({
          programId,
          lastSnapshot: data,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          extractionHistory: [historyEntry],
        });
      }
    } catch (error) {
      console.error(`Error saving snapshot for ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Create execution log
   */
  async createExecutionLog(): Promise<string> {
    try {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const log: ExecutionLog = {
        executionId,
        startTime: new Date(),
        totalPrograms: 0,
        successful: 0,
        failed: 0,
        errors: [],
      };

      await this.db.collection('executionLogs').doc(executionId).set({
        ...log,
        startTime: admin.firestore.Timestamp.fromDate(log.startTime),
      });

      return executionId;
    } catch (error) {
      console.error('Error creating execution log:', error);
      throw error;
    }
  }

  /**
   * Update execution log
   */
  async updateExecutionLog(
    executionId: string,
    updates: Partial<ExecutionLog>
  ): Promise<void> {
    try {
      const logRef = this.db.collection('executionLogs').doc(executionId);
      const updateData: any = {};

      if (updates.endTime) {
        updateData.endTime = admin.firestore.Timestamp.fromDate(updates.endTime);
      }
      if (updates.totalPrograms !== undefined) {
        updateData.totalPrograms = updates.totalPrograms;
      }
      if (updates.successful !== undefined) {
        updateData.successful = updates.successful;
      }
      if (updates.failed !== undefined) {
        updateData.failed = updates.failed;
      }
      if (updates.errors) {
        updateData.errors = updates.errors;
      }

      await logRef.update(updateData);
    } catch (error) {
      console.error(`Error updating execution log ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<{ allowed: boolean; resetAt?: Date }> {
    try {
      const rateLimitRef = this.db.collection('rateLimits').doc('requests');
      const doc = await rateLimitRef.get();

      if (!doc.exists) {
        // Initialize rate limit tracking
        await rateLimitRef.set({
          minuteCount: 0,
          hourCount: 0,
          lastMinuteReset: admin.firestore.Timestamp.now(),
          lastHourReset: admin.firestore.Timestamp.now(),
        });
        return { allowed: true };
      }

      const data = doc.data();
      if (!data) return { allowed: true };

      const now = new Date();
      const lastMinuteReset = (data.lastMinuteReset as admin.firestore.Timestamp).toDate();
      const lastHourReset = (data.lastHourReset as admin.firestore.Timestamp).toDate();

      const minuteElapsed = (now.getTime() - lastMinuteReset.getTime()) / 1000 / 60;
      const hourElapsed = (now.getTime() - lastHourReset.getTime()) / 1000 / 60 / 60;

      let minuteCount = data.minuteCount || 0;
      let hourCount = data.hourCount || 0;

      // Reset counters if time window passed
      if (minuteElapsed >= 1) {
        minuteCount = 0;
        await rateLimitRef.update({
          minuteCount: 0,
          lastMinuteReset: admin.firestore.Timestamp.now(),
        });
      }

      if (hourElapsed >= 1) {
        hourCount = 0;
        await rateLimitRef.update({
          hourCount: 0,
          lastHourReset: admin.firestore.Timestamp.now(),
        });
      }

      const allowed =
        minuteCount < config.rateLimiting.requestsPerMinute &&
        hourCount < config.rateLimiting.requestsPerHour;

      if (allowed) {
        await rateLimitRef.update({
          minuteCount: admin.firestore.FieldValue.increment(1),
          hourCount: admin.firestore.FieldValue.increment(1),
        });
      }

      return {
        allowed,
        resetAt: !allowed
          ? new Date(Math.min(
              lastMinuteReset.getTime() + 60000,
              lastHourReset.getTime() + 3600000
            ))
          : undefined,
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Allow on error to prevent blocking
      return { allowed: true };
    }
  }
}

