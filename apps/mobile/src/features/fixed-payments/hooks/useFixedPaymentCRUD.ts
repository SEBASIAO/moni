import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { FixedPayment } from '@/database/models/FixedPayment';
import type { Transaction } from '@/database/models/Transaction';
import { DEFAULT_CATEGORY_ID } from '@/database/seed';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface CreatePaymentInput {
  name: string;
  amount: number;
  paymentDay: number;
  periodYear: number;
  periodMonth: number;
}

interface UpdatePaymentInput {
  name: string;
  amount: number;
  paymentDay: number;
}

interface UseFixedPaymentCRUDResult {
  createPayment: (input: CreatePaymentInput) => Promise<void>;
  updatePayment: (id: string, input: UpdatePaymentInput) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  markPaid: (id: string, actualAmount: number, date?: number, accountId?: string) => Promise<void>;
  undoPaid: (id: string) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

export function useFixedPaymentCRUD(): UseFixedPaymentCRUDResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPayment = useCallback(async (input: CreatePaymentInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const collection = database.get<FixedPayment>('fixed_payments') as Collection<FixedPayment>;
        await collection.create((record) => {
          setRaw(record, {
            name: input.name,
            budgeted_amount: input.amount,
            actual_amount: null,
            payment_day: input.paymentDay,
            is_recurring: true,
            is_paid: false,
            period_year: input.periodYear,
            period_month: input.periodMonth,
          });
        });
      });
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updatePayment = useCallback(async (id: string, input: UpdatePaymentInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<FixedPayment>('fixed_payments').find(id);
        await record.update((r) => {
          r.name = input.name;
          r.budgetedAmount = input.amount;
          r.paymentDay = input.paymentDay;
        });
      });
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<FixedPayment>('fixed_payments').find(id);
        await record.markAsDeleted();
      });
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const markPaid = useCallback(async (id: string, actualAmount: number, date?: number, accountId?: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<FixedPayment>('fixed_payments').find(id);
        const transactionsCollection = database.get<Transaction>('transactions') as Collection<Transaction>;

        // Mark fixed payment as paid
        await record.update((r) => {
          r.isPaid = true;
          r.actualAmount = actualAmount;
        });

        // Create the actual transaction
        await transactionsCollection.create((tx) => {
          setRaw(tx, {
            total_amount: actualAmount,
            my_amount: actualAmount,
            description: record.name,
            date: date ?? Date.now(),
            category_id: DEFAULT_CATEGORY_ID,
            account_id: accountId ?? '',
            total_installments: 1,
            is_subscription: false,
            note: `fixed_payment:${id}`,
            period_year: record.periodYear,
            period_month: record.periodMonth,
          });
        });
      });
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const undoPaid = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<FixedPayment>('fixed_payments').find(id);
        const transactionsCollection = database.get<Transaction>('transactions') as Collection<Transaction>;

        // Undo the fixed payment
        await record.update((r) => {
          r.isPaid = false;
          r.actualAmount = null as unknown as number;
        });

        // Delete the associated transaction
        const linkedTxs = await transactionsCollection
          .query(Q.where('note', `fixed_payment:${id}`))
          .fetch();
        for (const tx of linkedTxs) {
          await tx.markAsDeleted();
        }
      });
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { createPayment, updatePayment, deletePayment, markPaid, undoPaid, isSaving, error };
}
