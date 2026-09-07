import * as SQLite from 'expo-sqlite';
import {
  CREATE_RIDES_TABLE,
  CREATE_TRACK_POINTS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_FUEL_LOGS_TABLE,
  CREATE_INDEXES,
} from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const DB_NAME = 'brovxi.db';

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      console.log(`[brovxi] [DB] Opening database connection: "${DB_NAME}"`);
      const startTime = Date.now();
      try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        if (!db) {
          throw new Error('SQLite.openDatabaseAsync returned null or undefined');
        }
        console.log(`[brovxi] [DB] Database connection established in ${Date.now() - startTime}ms. Initializing schema...`);
        await initDatabase(db);
        console.log(`[brovxi] [DB] Database schema and PRAGMAs initialized successfully in ${Date.now() - startTime}ms total`);
        dbInstance = db;
        return db;
      } catch (err) {
        console.error('[brovxi] [DB] Fatal error opening or initializing database:', err);
        // Reset dbPromise on failure so subsequent attempts can retry rather than caching the rejected promise
        dbPromise = null;
        dbInstance = null;
        throw err;
      }
    })();
  }

  return dbPromise;
}

export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  console.log(`[brovxi] [DB] Opening synchronous database connection: "${DB_NAME}"`);
  const db = SQLite.openDatabaseSync(DB_NAME);
  initDatabaseSync(db);
  dbInstance = db;
  return db;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('[brovxi] [DB] Configuring WAL mode and foreign keys...');
  // Enable foreign keys and WAL mode for better concurrency and data integrity
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  console.log('[brovxi] [DB] Creating tables and indexes if not exists...');
  await db.execAsync(CREATE_RIDES_TABLE);
  await db.execAsync(CREATE_TRACK_POINTS_TABLE);
  await db.execAsync(CREATE_SETTINGS_TABLE);
  await db.execAsync(CREATE_FUEL_LOGS_TABLE);
  await db.execAsync(CREATE_INDEXES);
  console.log('[brovxi] [DB] Tables and indexes ready');
}

function initDatabaseSync(db: SQLite.SQLiteDatabase): void {
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

  db.execSync(CREATE_RIDES_TABLE);
  db.execSync(CREATE_TRACK_POINTS_TABLE);
  db.execSync(CREATE_SETTINGS_TABLE);
  db.execSync(CREATE_FUEL_LOGS_TABLE);
  db.execSync(CREATE_INDEXES);
}

