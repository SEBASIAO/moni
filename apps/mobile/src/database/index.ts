import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import {
  Account,
  Category,
  FixedPayment,
  Income,
  Installment,
  MonthlyPeriod,
  RecurringTransaction,
  Transaction,
} from './models';
import { migrations } from './migrations';
import { moniSchema } from './schema';

let _instance: Database | null = null;

function createDatabase(): Database {
  const adapter = new SQLiteAdapter({
    schema: moniSchema,
    migrations,
    jsi: true,
    onSetUpError: (error) => {
      console.error('WatermelonDB setup error:', error);
    },
  });

  return new Database({
    adapter,
    modelClasses: [
      Account,
      Category,
      FixedPayment,
      Income,
      Installment,
      MonthlyPeriod,
      RecurringTransaction,
      Transaction,
    ],
  });
}

/**
 * Initializes the database. Must be awaited before any DB access.
 * Applies pending backup restore before creating the WatermelonDB instance.
 */
export async function initDatabase(): Promise<void> {
  if (_instance != null) return;

  // Dynamic import to avoid circular dependency (backup.ts imports database)
  const { applyPendingRestore } = await import('@/shared/utils/backup');
  await applyPendingRestore();

  _instance = createDatabase();
}

/**
 * Backwards-compatible export. All existing `import { database }` calls
 * work through this Proxy — it delegates to the singleton created by initDatabase().
 * If accessed before initDatabase() completes, it throws.
 */
export const database: Database = new Proxy({} as Database, {
  get(_target, prop) {
    if (_instance == null) {
      throw new Error(
        'Database accessed before initDatabase(). Ensure App waits for DB init.',
      );
    }
    return (_instance as Record<string | symbol, unknown>)[prop];
  },
});
