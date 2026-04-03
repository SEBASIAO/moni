import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import { DEFAULT_CATEGORY_ID } from '@/database/seed';
import type {
  Account,
  Category,
  FixedPayment,
  Income,
  Installment,
  MonthlyPeriod,
} from '@/database/models';
import type { IncomeFrequency } from '@/database/models';

import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';

import type { IncomeEntry } from '@/features/onboarding/components/IncomeStep';
import type { AccountEntry } from '@/features/onboarding/components/AccountsStep';
import type { CategoryEntry } from '@/features/onboarding/components/CategoriesStep';
import type { FixedPaymentEntry } from '@/features/onboarding/components/FixedPaymentsStep';
import type { DebtEntry } from '@/features/onboarding/components/DebtsStep';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface UseSaveOnboardingResult {
  saveIncomes: (incomes: IncomeEntry[]) => Promise<void>;
  saveAccounts: (accounts: AccountEntry[]) => Promise<string[]>;
  saveCategories: (categories: CategoryEntry[]) => Promise<void>;
  saveFixedPayments: (payments: FixedPaymentEntry[]) => Promise<void>;
  saveDebts: (debts: DebtEntry[], accountIds: string[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

export function useSaveOnboarding(): UseSaveOnboardingResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setOnboarded = useOnboardingStore((s) => s.setOnboarded);

  const wrapSave = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsSaving(true);
      setError(null);
      try {
        const result = await fn();
        return result;
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

  const saveIncomes = useCallback(
    async (incomes: IncomeEntry[]) => {
      await wrapSave(async () => {
        const now = new Date();
        const periodYear = now.getFullYear();
        const periodMonth = now.getMonth() + 1;

        await database.write(async () => {
          const collection = database.get<Income>('incomes') as Collection<Income>;

          // Remove any previously saved incomes to avoid duplicates
          // when the user navigates back and forward in onboarding.
          const existing = await collection.query().fetch();
          for (const record of existing) {
            await record.markAsDeleted();
          }

          for (const income of incomes) {
            const amount = typeof income.amount === 'number' ? income.amount : parseInt(String(income.amount), 10) || 0;
            if (amount <= 0) continue;

            await collection.create((record) => {
              setRaw(record, {
                name: income.name || 'Ingreso',
                expected_amount: amount,
                actual_amount: null,
                expected_date: 1,
                is_recurring: true,
                frequency: income.frequency,
                period_year: periodYear,
                period_month: periodMonth,
              });
            });
          }
        });
      });
    },
    [wrapSave],
  );

  const saveAccounts = useCallback(
    async (accounts: AccountEntry[]): Promise<string[]> => {
      return wrapSave(async () => {
        const ids: string[] = [];
        await database.write(async () => {
          const collection = database.get<Account>('accounts') as Collection<Account>;

          // Remove any previously saved accounts to avoid duplicates
          // when the user navigates back and forward in onboarding.
          const existing = await collection.query().fetch();
          for (const record of existing) {
            await record.markAsDeleted();
          }

          for (const account of accounts) {
            const created = await collection.create((record) => {
              setRaw(record, {
                name: account.name,
                type: account.type,
                cut_off_day: account.cutOffDay ? parseInt(account.cutOffDay, 10) : null,
                payment_day: account.paymentDay ? parseInt(account.paymentDay, 10) : null,
                icon: null,
                is_active: true,
              });
            });
            ids.push(created.id);
          }
        });
        return ids;
      });
    },
    [wrapSave],
  );

  const saveCategories = useCallback(
    async (categories: CategoryEntry[]) => {
      await wrapSave(async () => {
        await database.write(async () => {
          const collection = database.get<Category>('categories') as Collection<Category>;

          // Remove any previously saved categories to avoid duplicates
          // when the user navigates back and forward in onboarding.
          // Preserve the default "Otros" category created by seedDefaults.
          const existing = await collection.query(Q.where('id', Q.notEq(DEFAULT_CATEGORY_ID))).fetch();
          for (const record of existing) {
            await record.markAsDeleted();
          }

          let sortOrder = 0;
          for (const category of categories) {
            if (!category.enabled || !category.name.trim()) continue;
            await collection.create((record) => {
              setRaw(record, {
                name: category.name.trim(),
                type: 'variable' as const,
                monthly_budget: typeof category.budget === 'number' ? category.budget : parseInt(String(category.budget), 10) || 0,
                icon: null,
                color: null,
                sort_order: sortOrder,
                is_active: true,
              });
            });
            sortOrder++;
          }
        });
      });
    },
    [wrapSave],
  );

  const saveFixedPayments = useCallback(
    async (payments: FixedPaymentEntry[]) => {
      await wrapSave(async () => {
        const now = new Date();
        const periodYear = now.getFullYear();
        const periodMonth = now.getMonth() + 1;

        await database.write(async () => {
          const collection = database.get<FixedPayment>(
            'fixed_payments',
          ) as Collection<FixedPayment>;

          // Remove any previously saved fixed payments to avoid duplicates
          // when the user navigates back and forward in onboarding.
          const existingFP = await collection.query().fetch();
          for (const record of existingFP) {
            await record.markAsDeleted();
          }

          for (const payment of payments) {
            const amount = typeof payment.amount === 'number' ? payment.amount : parseInt(String(payment.amount), 10) || 0;
            if (!payment.name.trim() || amount <= 0) continue;

            const paymentDay = parseInt(payment.day, 10) || 1;

            await collection.create((record) => {
              setRaw(record, {
                name: payment.name.trim(),
                budgeted_amount: amount,
                actual_amount: null,
                payment_day: paymentDay,
                is_recurring: true,
                is_paid: false,
                period_year: periodYear,
                period_month: periodMonth,
              });
            });
          }
        });
      });
    },
    [wrapSave],
  );

  const saveDebts = useCallback(
    async (debts: DebtEntry[], accountIds: string[]) => {
      await wrapSave(async () => {
        const now = new Date();
        const periodYear = now.getFullYear();
        const periodMonth = now.getMonth() + 1;

        await database.write(async () => {
          const installmentsCollection = database.get<Installment>(
            'installments',
          ) as Collection<Installment>;

          // Remove orphan installments from previous onboarding attempts
          const existing = await installmentsCollection
            .query(Q.where('transaction_id', ''))
            .fetch();
          for (const record of existing) {
            await record.markAsDeleted();
          }

          for (const debt of debts) {
            const amount = parseInt(debt.amount, 10) || 0;
            const currentInst = parseInt(debt.currentInstallment, 10) || 1;
            const totalInst = parseInt(debt.totalInstallments, 10) || 1;
            if (!debt.description.trim() || amount <= 0) continue;

            const accountId =
              debt.accountIndex !== null && debt.accountIndex < accountIds.length
                ? accountIds[debt.accountIndex]
                : accountIds[0] ?? '';

            for (let i = 1; i <= totalInst; i++) {
              const dueMonth = ((periodMonth - 1 + (i - currentInst)) % 12) + 1;
              const dueYear =
                periodYear +
                Math.floor((periodMonth - 1 + (i - currentInst)) / 12);

              await installmentsCollection.create((record) => {
                setRaw(record, {
                  transaction_id: '',
                  account_id: accountId,
                  description: debt.description.trim(),
                  installment_number: i,
                  total_installments: totalInst,
                  amount,
                  due_year: dueYear,
                  due_month: dueMonth,
                  is_paid: i < currentInst,
                });
              });
            }
          }
        });
      });
    },
    [wrapSave],
  );

  const completeOnboarding = useCallback(async () => {
    await wrapSave(async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      await database.write(async () => {
        const collection = database.get<MonthlyPeriod>(
          'monthly_periods',
        ) as Collection<MonthlyPeriod>;
        await collection.create((record) => {
          setRaw(record, {
            year,
            month,
            is_active: true,
          });
        });
      });

      setOnboarded(true);
    });
  }, [wrapSave, setOnboarded]);

  return {
    saveIncomes,
    saveAccounts,
    saveCategories,
    saveFixedPayments,
    saveDebts,
    completeOnboarding,
    isSaving,
    error,
  };
}
