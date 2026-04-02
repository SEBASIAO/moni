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

const adapter = new SQLiteAdapter({
  schema: moniSchema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    // TODO: handle database setup error (e.g. corrupted DB)
    console.error('WatermelonDB setup error:', error);
  },
});

export const database = new Database({
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
