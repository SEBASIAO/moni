import { useCallback } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { RecurringTransaction } from '@/database/models';
import type { RecurringFrequency } from '@/database/models';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface RecurringTransactionInput {
  name: string;
  amount: number;
  categoryId: string;
  accountId: string;
  frequency: RecurringFrequency;
  dayOfMonth: number;
}

interface RecurringTransactionUpdate {
  name?: string;
  amount?: number;
  categoryId?: string;
  accountId?: string;
  frequency?: RecurringFrequency;
  dayOfMonth?: number;
  isActive?: boolean;
}

interface UseRecurringTransactionsResult {
  getAll: () => Promise<RecurringTransaction[]>;
  create: (data: RecurringTransactionInput) => Promise<RecurringTransaction>;
  update: (id: string, data: RecurringTransactionUpdate) => Promise<void>;
  deactivate: (id: string) => Promise<void>;
}

export function useRecurringTransactions(): UseRecurringTransactionsResult {
  const collection = database.get<RecurringTransaction>(
    'recurring_transactions',
  ) as Collection<RecurringTransaction>;

  const getAll = useCallback(async (): Promise<RecurringTransaction[]> => {
    return collection.query().fetch();
  }, [collection]);

  const create = useCallback(
    async (data: RecurringTransactionInput): Promise<RecurringTransaction> => {
      return database.write(async () => {
        return collection.create((record) => {
          setRaw(record, {
            name: data.name,
            amount: data.amount,
            category_id: data.categoryId,
            account_id: data.accountId,
            frequency: data.frequency,
            day_of_month: data.dayOfMonth,
            is_active: true,
          });
        });
      });
    },
    [collection],
  );

  const update = useCallback(
    async (id: string, data: RecurringTransactionUpdate): Promise<void> => {
      await database.write(async () => {
        const record = await collection.find(id);
        await record.update((r) => {
          const raw: Record<string, unknown> = {};
          if (data.name !== undefined) raw.name = data.name;
          if (data.amount !== undefined) raw.amount = data.amount;
          if (data.categoryId !== undefined) raw.category_id = data.categoryId;
          if (data.accountId !== undefined) raw.account_id = data.accountId;
          if (data.frequency !== undefined) raw.frequency = data.frequency;
          if (data.dayOfMonth !== undefined) raw.day_of_month = data.dayOfMonth;
          if (data.isActive !== undefined) raw.is_active = data.isActive;
          setRaw(r, raw);
        });
      });
    },
    [collection],
  );

  const deactivate = useCallback(
    async (id: string): Promise<void> => {
      await database.write(async () => {
        const record = await collection.find(id);
        await record.update((r) => {
          setRaw(r, { is_active: false });
        });
      });
    },
    [collection],
  );

  return { getAll, create, update, deactivate };
}
