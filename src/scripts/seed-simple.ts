/**
 * Simple seed script - uses Firebase Admin with project ID only
 */

import * as admin from 'firebase-admin';

// Initialize Firebase with project ID only (for Firestore emulator or default credentials)
admin.initializeApp({
  projectId: 'program-info-extractor',
});

const db = admin.firestore();

const mockPrograms = [
  {
    programId: 'MIT_Computer_Science',
    lastSnapshot: {
      intakeOffered: 'Fall, Spring',
      intakeStatus: 'open',
      applicationDeadline: '2024-12-15',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-11-01',
      admissionAlerts: 'Early decision deadline: 2024-11-01',
    },
    lastUpdated: new Date('2024-01-15'),
  },
  {
    programId: 'Harvard_Business_Administration',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'open',
      applicationDeadline: '2024-12-01',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-10-15',
      admissionAlerts: 'Round 1 deadline approaching',
    },
    lastUpdated: new Date('2024-01-14'),
  },
  {
    programId: 'Oxford_Computer_Science',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'open',
      applicationDeadline: '2024-10-15',
      casDeadline: '2024-11-01',
      i20Deadline: 'NOT_FOUND',
      admissionAlerts: 'UK visa processing may take 3-4 weeks',
    },
    lastUpdated: new Date('2024-01-13'),
  },
  {
    programId: 'Stanford_Data_Science',
    lastSnapshot: {
      intakeOffered: 'Fall, Spring, Summer',
      intakeStatus: 'open',
      applicationDeadline: '2024-12-20',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-11-15',
      admissionAlerts: 'Scholarship deadline: 2024-11-01',
    },
    lastUpdated: new Date('2024-01-12'),
  },
  {
    programId: 'Cambridge_Engineering',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'closed',
      applicationDeadline: '2024-01-15',
      casDeadline: '2024-02-01',
      i20Deadline: 'NOT_FOUND',
      admissionAlerts: 'Applications closed for Fall 2024',
    },
    lastUpdated: new Date('2024-01-10'),
  },
  {
    programId: 'UC_Berkeley_AI',
    lastSnapshot: {
      intakeOffered: 'Fall',
      intakeStatus: 'waitlist',
      applicationDeadline: '2024-12-10',
      casDeadline: 'NOT_FOUND',
      i20Deadline: '2024-10-30',
      admissionAlerts: 'Program is currently on waitlist',
    },
    lastUpdated: new Date('2024-01-11'),
  },
];

const mockLogs = [
  {
    executionId: 'exec_1705312200000_demo1',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T10:45:00Z'),
    totalPrograms: 6,
    successful: 5,
    failed: 1,
    errors: [{ programId: 'Harvard_Business_Administration', error: 'Timeout fetching URL' }],
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

async function seed() {
  console.log('🌱 Seeding mock data...\n');

  try {
    // Seed programs
    console.log('📦 Seeding program snapshots...');
    for (const program of mockPrograms) {
      await db.collection('programSnapshots').doc(program.programId).set({
        programId: program.programId,
        lastSnapshot: program.lastSnapshot,
        lastUpdated: admin.firestore.Timestamp.fromDate(program.lastUpdated),
        extractionHistory: [{
          timestamp: admin.firestore.Timestamp.fromDate(program.lastUpdated),
          status: 'SUCCESS',
          data: program.lastSnapshot,
        }],
      });
      console.log(`  ✅ ${program.programId}`);
    }

    // Seed logs
    console.log('\n📊 Seeding execution logs...');
    for (const log of mockLogs) {
      await db.collection('executionLogs').doc(log.executionId).set({
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
    await db.collection('rateLimits').doc('requests').set({
      minuteCount: 0,
      hourCount: 0,
      lastMinuteReset: admin.firestore.Timestamp.now(),
      lastHourReset: admin.firestore.Timestamp.now(),
    });

    console.log('\n✨ Mock data seeded successfully!');
    console.log('\n🔗 View at: https://program-info-extractor.web.app');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'permission-denied') {
      console.error('\n💡 Tip: Make sure Firestore is enabled and rules allow writes');
      console.error('   Visit: https://console.firebase.google.com/project/program-info-extractor/firestore');
    }
    process.exit(1);
  }
}

seed().then(() => process.exit(0));

