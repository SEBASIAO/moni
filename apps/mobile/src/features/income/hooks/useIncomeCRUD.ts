import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Income } from '@/database/models/Income';
import type { IncomeFrequency } from '@/database/models/Income';

function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface CreateIncomeInput {
  name: string;
  expectedAmount: number;
  frequency: IncomeFrequency;
  periodYear: number;
  periodMonth: number;
}

interface UpdateIncomeInput {
  name: string;
  expectedAmount: number;
  frequency: IncomeFrequency;
}

interface UseIncomeCRUDResult {
  createIncome: (input: CreateIncomeInput) => Promise<void>;
  updateIncome: (id: string, input: UpdateIncomeInput) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

export function useIncomeCRUD(): UseIncomeCRUDResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createIncome = useCallback(async (input: CreateIncomeInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const collection = database.get<Income>('incomes') as Collection<Income>;
        await collection.create((record) => {
          setRaw(record, {
            name: input.name,
            expected_amount: input.expectedAmount,
            actual_amount: null,
            expected_date: 1,
            is_recurring: input.frequency !== 'one_time',
            frequency: input.frequency,
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

  const updateIncome = useCallback(async (id: string, input: UpdateIncomeInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<Income>('incomes').find(id);
        await record.update((r) => {
          r.name = input.name;
          r.expectedAmount = input.expectedAmount;
          r.frequency = input.frequency;
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

  const deleteIncome = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<Income>('incomes').find(id);
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

  return { createIncome, updateIncome, deleteIncome, isSaving, error };
}
