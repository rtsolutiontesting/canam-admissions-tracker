/**
 * Seed mock data into Firestore
 * Run: npm run seed
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import { config } from '../config';
import { ExtractedData, ExtractionStatus } from '../types';

// Initialize Firebase
const serviceAccount = require(path.resolve(config.firebase.serviceAccountKeyPath));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: config.firebase.projectId,
});

const db = admin.firestore();

// Mock universities and programs
const mockPrograms = [
  {
    programId: 'MIT_Computer_Science',
    universityName: 'Massachusetts Institute of Technology',
    programName: 'Computer Science',
    country: 'USA',
    lastSnapshot: {
      intakeOffered: 'Fall, Spring',
      intakeStatus: 'open' as const,
      applicationDeadline: '2024-12-15',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-11-01',
      admissionAlerts: 'Early decision deadline: 2024-11-01',
    },
    lastUpdated: new Date('2024-01-15'),
  },
  {
    programId: 'Harvard_Business_Administration',
    universityName: 'Harvard University',
    programName: 'MBA',
    country: 'USA',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'open' as const,
      applicationDeadline: '2024-12-01',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-10-15',
      admissionAlerts: 'Round 1 deadline approaching',
    },
    lastUpdated: new Date('2024-01-14'),
  },
  {
    programId: 'Oxford_Computer_Science',
    universityName: 'University of Oxford',
    programName: 'Computer Science',
    country: 'UK',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'open' as const,
      applicationDeadline: '2024-10-15',
      casDeadline: '2024-11-01',
      i20Deadline: 'NOT_FOUND',
      admissionAlerts: 'UK visa processing may take 3-4 weeks',
    },
    lastUpdated: new Date('2024-01-13'),
  },
  {
    programId: 'Stanford_Data_Science',
    universityName: 'Stanford University',
    programName: 'Data Science',
    country: 'USA',
    lastSnapshot: {
      intakeOffered: 'Fall, Spring, Summer',
      intakeStatus: 'open' as const,
      applicationDeadline: '2024-12-20',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-11-15',
      admissionAlerts: 'Scholarship deadline: 2024-11-01',
    },
    lastUpdated: new Date('2024-01-12'),
  },
  {
    programId: 'Cambridge_Engineering',
    universityName: 'University of Cambridge',
    programName: 'Engineering',
    country: 'UK',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'closed' as const,
      applicationDeadline: '2024-01-15',
      casDeadline: '2024-02-01',
      i20Deadline: 'NOT_FOUND',
      admissionAlerts: 'Applications closed for Fall 2024',
    },
    lastUpdated: new Date('2024-01-10'),
  },
  {
    programId: 'UC_Berkeley_AI',
    universityName: 'UC Berkeley',
    programName: 'Artificial Intelligence',
    country: 'USA',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'waitlist' as const,
      applicationDeadline: '2024-12-10',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-10-30',
      admissionAlerts: 'Program is currently on waitlist',
    },
    lastUpdated: new Date('2024-01-11'),
  },
];

// Mock execution logs
const mockExecutionLogs = [
  {
    executionId: 'exec_1705312200000_demo1',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T10:45:00Z'),
    totalPrograms: 6,
    successful: 5,
    failed: 1,
    errors: [
      {
        programId: 'Harvard_Business_Administration',
        error: 'Timeout fetching URL',
      },
    ],
  },
  {
    executionId: 'exec_1705225800000_demo2',
    startTime: new Date('2024-01-14T09:00:00Z'),
    endTime: new Date('2024-01-14T09:30:00Z'),
    totalPrograms: 6,
    successful: 6,
    failed: 0,
    errors: [],
  },
];

async function seedMockData() {
  console.log('🌱 Seeding mock data to Firestore...\n');

  try {
    // Seed program snapshots
    console.log('📦 Seeding program snapshots...');
    for (const program of mockPrograms) {
      const docRef = db.collection('programSnapshots').doc(program.programId);
      
      await docRef.set({
        programId: program.programId,
        lastSnapshot: program.lastSnapshot,
        lastUpdated: admin.firestore.Timestamp.fromDate(program.lastUpdated),
        extractionHistory: [
          {
            timestamp: admin.firestore.Timestamp.fromDate(program.lastUpdated),
            status: ExtractionStatus.SUCCESS,
            data: program.lastSnapshot,
          },
        ],
      });
      
      console.log(`  ✅ ${program.programId}`);
    }

    // Seed execution logs
    console.log('\n📊 Seeding execution logs...');
    for (const log of mockExecutionLogs) {
      const docRef = db.collection('executionLogs').doc(log.executionId);
      
      await docRef.set({
        executionId: log.executionId,
        startTime: admin.firestore.Timestamp.fromDate(log.startTime),
        endTime: admin.firestore.Timestamp.fromDate(log.endTime),
        totalPrograms: log.totalPrograms,
        successful: log.successful,
        failed: log.failed,
        errors: log.errors,
      });
      
      console.log(`  ✅ ${log.executionId}`);
    }

    // Initialize rate limits
    console.log('\n⏱️  Initializing rate limits...');
    await db.collection('rateLimits').doc('requests').set({
      minuteCount: 0,
      hourCount: 0,
      lastMinuteReset: admin.firestore.Timestamp.now(),
      lastHourReset: admin.firestore.Timestamp.now(),
    });
    console.log('  ✅ Rate limits initialized');

    console.log('\n✨ Mock data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${mockPrograms.length} program snapshots`);
    console.log(`   - ${mockExecutionLogs.length} execution logs`);
    console.log('   - Rate limits initialized');
    console.log('\n🔗 View data at: https://console.firebase.google.com/project/program-info-extractor/firestore');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedMockData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedMockData };

