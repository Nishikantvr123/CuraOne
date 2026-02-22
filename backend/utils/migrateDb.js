/**
 * Database Migration Utility for CuraOne
 * Ensures all required collections exist without modifying existing data
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const DB_FILE = './data/database.json';

// Define all required collections for CuraOne
const REQUIRED_COLLECTIONS = [
  // Existing collections
  'users',
  'therapies',
  'sessions',
  'bookings',
  'wellness_checkins',
  'feedback',
  'notifications',
  'practitioners',
  // New collections for CuraOne features
  'chats',           // CuraBot chat history
  'prescriptions',   // E-Prescription system
  'payments',        // Payment records
  'inventory',       // Medicine/inventory stock
  'doshaProfiles',   // Dosha quiz results
  'auditLogs'        // Audit log system
];

/**
 * Load the current database
 */
const loadDatabase = async () => {
  try {
    if (existsSync(DB_FILE)) {
      const data = await readFile(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('❌ Error loading database for migration:', error.message);
    return {};
  }
};

/**
 * Save the database
 */
const saveDatabase = async (db) => {
  try {
    // Ensure data directory exists
    try {
      await mkdir('./data', { recursive: true });
    } catch (err) {
      // Directory already exists
    }
    
    await writeFile(DB_FILE, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error saving database after migration:', error.message);
    return false;
  }
};

/**
 * Run database migration
 * Ensures all required collections exist without modifying existing data
 */
export const migrateDatabase = async () => {
  console.log('📦 Running database migration...');
  
  const db = await loadDatabase();
  let collectionsAdded = [];
  
  // Check and add missing collections
  for (const collection of REQUIRED_COLLECTIONS) {
    if (!db[collection]) {
      db[collection] = [];
      collectionsAdded.push(collection);
    }
  }
  
  // Only save if changes were made
  if (collectionsAdded.length > 0) {
    const saved = await saveDatabase(db);
    if (saved) {
      console.log(`✅ Migration complete. Added collections: ${collectionsAdded.join(', ')}`);
    } else {
      console.log('⚠️ Migration completed but failed to save. Collections will be created on first use.');
    }
  } else {
    console.log('✅ Database schema is up to date. No migration needed.');
  }
  
  return {
    success: true,
    collectionsAdded,
    totalCollections: REQUIRED_COLLECTIONS.length
  };
};

/**
 * Get migration status
 */
export const getMigrationStatus = async () => {
  const db = await loadDatabase();
  const existingCollections = Object.keys(db);
  const missingCollections = REQUIRED_COLLECTIONS.filter(c => !existingCollections.includes(c));
  
  return {
    requiredCollections: REQUIRED_COLLECTIONS,
    existingCollections,
    missingCollections,
    isComplete: missingCollections.length === 0
  };
};

export default {
  migrateDatabase,
  getMigrationStatus,
  REQUIRED_COLLECTIONS
};
