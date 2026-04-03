import { useCallback } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { RecurringTransaction, Transaction } from '@/database/models';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

/**
 * Build a timestamp for a specific day in the given year/month.
 * Clamps the day to the last valid day of the month.
 */
function buildDate(year: number, month: number, dayOfMonth: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  const day = Math.min(dayOfMonth, lastDay);
  return new Date(year, month - 1, day).getTime();
}

interface UseGenerateMonthlyTransactionsResult {
  generate: (year: number, month: number) => Promise<number>;
}

export function useGenerateMonthlyTransactions(): UseGenerateMonthlyTransactionsResult {
  const generate = useCallback(async (year: number, month: number): Promise<number> => {
    const recurringCollection = database.get<RecurringTransaction>(
      'recurring_transactions',
    ) as Collection<RecurringTransaction>;

    const transactionsCollection = database.get<Transaction>(
      'transactions',
    ) as Collection<Transaction>;

    const activeTemplates = await recurringCollection
      .query(Q.where('is_active', true))
      .fetch();

    if (activeTemplates.length === 0) {
      return 0;
    }

    let created = 0;

    await database.write(async () => {
      for (const template of activeTemplates) {
        const existing = await transactionsCollection
          .query(
            Q.where('recurring_transaction_id', template.id),
            Q.where('period_year', year),
            Q.where('period_month', month),
          )
          .fetchCount();

        if (existing > 0) {
          continue;
        }

        await transactionsCollection.create((record) => {
          setRaw(record, {
            total_amount: template.amount,
            my_amount: template.amount,
            description: template.name,
            date: buildDate(year, month, template.dayOfMonth),
            category_id: template.categoryId,
            account_id: template.accountId,
            total_installments: 1,
            is_subscription: true,
            recurring_transaction_id: template.id,
            period_year: year,
            period_month: month,
          });
        });

        created += 1;
      }
    });

    return created;
  }, []);

  return { generate };
}
