import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Account } from '@/database/models/Account';
import type { Category } from '@/database/models/Category';
import type { Saving } from '@/database/models/Saving';
import type { Transaction } from '@/database/models/Transaction';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface CreateSavingInput {
  name: string;
  targetAmount: number | null;
  initialAmount?: number;
  icon?: string | null;
  color?: string | null;
}

interface UpdateSavingInput {
  name: string;
  targetAmount: number | null;
}

interface UseSavingsCRUDResult {
  createSaving: (input: CreateSavingInput) => Promise<void>;
  updateSaving: (id: string, input: UpdateSavingInput) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;
  updateBalance: (id: string, newAmount: number) => Promise<void>;
  addFunds: (
    savingId: string,
    amount: number,
    sourceAccountId: string,
    periodYear: number,
    periodMonth: number,
  ) => Promise<void>;
  withdrawFromSaving: (
    savingId: string,
    amount: number,
    targetCategoryId: string,
    periodYear: number,
    periodMonth: number,
  ) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

export function useSavingsCRUD(): UseSavingsCRUDResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSaving = useCallback(async (input: CreateSavingInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const categoriesCollection = database.get<Category>('categories') as Collection<Category>;
        const accountsCollection = database.get<Account>('accounts') as Collection<Account>;
        const savingsCollection = database.get<Saving>('savings') as Collection<Saving>;

        const category = await categoriesCollection.create((record) => {
          setRaw(record, {
            type: 'savings',
            name: input.name,
            monthly_budget: 0,
            is_active: true,
            sort_order: 0,
            icon: input.icon ?? null,
            color: input.color ?? null,
          });
        });

        const account = await accountsCollection.create((record) => {
          setRaw(record, {
            type: 'savings',
            name: input.name,
            is_active: true,
            icon: input.icon ?? null,
          });
        });

        await savingsCollection.create((record) => {
          setRaw(record, {
            name: input.name,
            linked_category_id: category.id,
            linked_account_id: account.id,
            current_amount: input.initialAmount ?? 0,
            target_amount: input.targetAmount,
            icon: input.icon ?? null,
            color: input.color ?? null,
            is_active: true,
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

  const updateSaving = useCallback(async (id: string, input: UpdateSavingInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const saving = await database.get<Saving>('savings').find(id);

        await saving.update((r) => {
          r.name = input.name;
          r.targetAmount = input.targetAmount;
        });

        const category = await database.get<Category>('categories').find(saving.linkedCategoryId);
        await category.update((r) => {
          r.name = input.name;
        });

        const account = await database.get<Account>('accounts').find(saving.linkedAccountId);
        await account.update((r) => {
          r.name = input.name;
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

  const deleteSaving = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const saving = await database.get<Saving>('savings').find(id);

        await saving.markAsDeleted();

        const category = await database.get<Category>('categories').find(saving.linkedCategoryId);
        await category.markAsDeleted();

        const account = await database.get<Account>('accounts').find(saving.linkedAccountId);
        await account.markAsDeleted();
      });
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      throw wrapped;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateBalance = useCallback(async (id: string, desiredTotal: number) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const saving = await database.get<Saving>('savings').find(id);
        const txCollection = database.get<Transaction>('transactions');

        // Compute current transaction-derived balance
        const deposits = await txCollection
          .query(Q.where('category_id', saving.linkedCategoryId))
          .fetch();
        const withdrawals = await txCollection
          .query(Q.where('account_id', saving.linkedAccountId))
          .fetch();

        const depositSum = deposits.reduce((sum, tx) => sum + tx.myAmount, 0);
        const withdrawalSum = withdrawals.reduce((sum, tx) => sum + tx.myAmount, 0);
        const txBalance = depositSum - withdrawalSum;

        // Set base so that base + txBalance = desiredTotal
        await saving.update((r) => {
          r.currentAmount = desiredTotal - txBalance;
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

  const addFunds = useCallback(
    async (
      savingId: string,
      amount: number,
      sourceAccountId: string,
      periodYear: number,
      periodMonth: number,
    ) => {
      setIsSaving(true);
      setError(null);

      try {
        await database.write(async () => {
          const saving = await database.get<Saving>('savings').find(savingId);
          const transactionsCollection = database.get<Transaction>('transactions') as Collection<Transaction>;

          await transactionsCollection.create((tx) => {
            setRaw(tx, {
              total_amount: amount,
              my_amount: amount,
              description: saving.name,
              date: Date.now(),
              category_id: saving.linkedCategoryId,
              account_id: sourceAccountId,
              total_installments: 1,
              is_subscription: false,
              note: `saving_deposit:${savingId}`,
              period_year: periodYear,
              period_month: periodMonth,
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
    },
    [],
  );

  const withdrawFromSaving = useCallback(
    async (
      savingId: string,
      amount: number,
      targetCategoryId: string,
      periodYear: number,
      periodMonth: number,
    ) => {
      setIsSaving(true);
      setError(null);

      try {
        await database.write(async () => {
          const saving = await database.get<Saving>('savings').find(savingId);
          const transactionsCollection = database.get<Transaction>('transactions') as Collection<Transaction>;

          await transactionsCollection.create((tx) => {
            setRaw(tx, {
              total_amount: amount,
              my_amount: amount,
              description: saving.name,
              date: Date.now(),
              category_id: targetCategoryId,
              account_id: saving.linkedAccountId,
              total_installments: 1,
              is_subscription: false,
              note: `saving_withdrawal:${savingId}`,
              period_year: periodYear,
              period_month: periodMonth,
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
    },
    [],
  );

  return { createSaving, updateSaving, deleteSaving, updateBalance, addFunds, withdrawFromSaving, isSaving, error };
}
