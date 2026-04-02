import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Installment, Transaction } from '@/database/models';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface SaveTransactionInput {
  totalAmount: number;
  myAmount: number;
  description: string;
  transactionDate: number;
  categoryId: string;
  accountId: string;
  totalInstallments: number;
  isSubscription: boolean;
  note: string | null;
  periodYear: number;
  periodMonth: number;
}

interface UseSaveTransactionResult {
  /** Persist a transaction (and installments if cuotas > 1). */
  save: (input: SaveTransactionInput) => Promise<void>;
  /** Whether a save operation is in progress. */
  isSaving: boolean;
  /** Last save error, if any. */
  error: Error | null;
}

/**
 * Hook that wraps WatermelonDB write to create a Transaction
 * and, when `totalInstallments > 1`, the corresponding Installment rows.
 */
export function useSaveTransaction(): UseSaveTransactionResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = useCallback(async (input: SaveTransactionInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const transactionsCollection =
          database.get<Transaction>('transactions') as Collection<Transaction>;
        const transaction = await transactionsCollection.create((record) => {
          setRaw(record, {
            total_amount: input.totalAmount,
            my_amount: input.myAmount,
            description: input.description,
            date: input.transactionDate,
            category_id: input.categoryId,
            account_id: input.accountId,
            total_installments: input.totalInstallments,
            is_subscription: input.isSubscription,
            note: input.note ?? '',
            period_year: input.periodYear,
            period_month: input.periodMonth,
          });
        });

        if (input.totalInstallments > 1) {
          const installmentsCollection =
            database.get<Installment>('installments') as Collection<Installment>;
          const amountPerInstallment = Math.round(
            input.myAmount / input.totalInstallments,
          );

          for (let i = 1; i <= input.totalInstallments; i++) {
            const dueMonth =
              ((input.periodMonth - 1 + (i - 1)) % 12) + 1;
            const dueYear =
              input.periodYear +
              Math.floor((input.periodMonth - 1 + (i - 1)) / 12);

            await installmentsCollection.create((record) => {
              setRaw(record, {
                transaction_id: transaction.id,
                account_id: input.accountId,
                installment_number: i,
                total_installments: input.totalInstallments,
                amount: amountPerInstallment,
                due_year: dueYear,
                due_month: dueMonth,
                is_paid: i === 1,
              });
            });
          }
        }
      });
    } catch (err) {
      const wrapped =
        err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { save, isSaving, error };
}
