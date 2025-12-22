/**
 * Create default users for the application
 * Run: npm run create-users
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import { config } from '../config';

// Initialize Firebase
const serviceAccount = require(path.resolve(config.firebase.serviceAccountKeyPath));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: config.firebase.projectId,
});

const auth = admin.auth();

// Default users to create
const defaultUsers = [
  {
    email: 'admin@canamiapply.com',
    password: 'Admin@123',
    displayName: 'Admin User',
    role: 'ADMIN',
  },
  {
    email: 'manager@canamiapply.com',
    password: 'Manager@123',
    displayName: 'Manager User',
    role: 'MANAGER',
  },
  {
    email: 'user@canamiapply.com',
    password: 'User@123',
    displayName: 'Regular User',
    role: 'USER',
  },
];

async function createUsers() {
  console.log('👥 Creating default users...\n');

  for (const userData of defaultUsers) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`⚠️  User ${userData.email} already exists. Skipping...`);
        continue;
      } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // Create user
      user = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true,
      });

      // Set custom claims for role
      await auth.setCustomUserClaims(user.uid, {
        role: userData.role,
      });

      console.log(`✅ Created user: ${userData.email}`);
      console.log(`   - Display Name: ${userData.displayName}`);
      console.log(`   - Role: ${userData.role}`);
      console.log(`   - Password: ${userData.password}`);
      console.log('');

    } catch (error: any) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }

  console.log('\n✨ User creation complete!');
  console.log('\n📋 User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  defaultUsers.forEach(user => {
    console.log(`\nEmail: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Role: ${user.role}`);
  });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run if executed directly
if (require.main === module) {
  createUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { createUsers };

