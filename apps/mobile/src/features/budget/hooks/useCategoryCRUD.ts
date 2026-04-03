import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Category } from '@/database/models/Category';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface CategoryInput {
  name: string;
  monthlyBudget: number;
}

interface UseCategoryCRUDResult {
  createCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: string, input: CategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

export function useCategoryCRUD(): UseCategoryCRUDResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCategory = useCallback(async (input: CategoryInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const collection = database.get<Category>('categories') as Collection<Category>;
        await collection.create((record) => {
          setRaw(record, {
            name: input.name,
            type: 'variable',
            monthly_budget: input.monthlyBudget,
            icon: null,
            color: null,
            sort_order: 0,
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

  const updateCategory = useCallback(async (id: string, input: CategoryInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<Category>('categories').find(id);
        await record.update((r) => {
          r.name = input.name;
          r.monthlyBudget = input.monthlyBudget;
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

  const deleteCategory = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<Category>('categories').find(id);
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

  return { createCategory, updateCategory, deleteCategory, isSaving, error };
}
