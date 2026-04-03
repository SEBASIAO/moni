import { useCallback, useState } from 'react';

import type { Collection, Model } from '@nozbe/watermelondb';

import { database } from '@/database';
import { Account } from '@/database/models/Account';
import type { AccountType } from '@/database/models/Account';

/** Helper to set raw column values inside a WatermelonDB `create` callback. */
function setRaw(record: Model, values: Record<string, unknown>): void {
  Object.assign(record._raw, values);
}

interface CreateAccountInput {
  name: string;
  type: AccountType;
  cutOffDay?: number | null;
  paymentDay?: number | null;
}

interface UpdateAccountInput {
  name: string;
  cutOffDay?: number | null;
  paymentDay?: number | null;
}

interface UseAccountCRUDResult {
  /** Create a new Account record. */
  createAccount: (input: CreateAccountInput) => Promise<void>;
  /** Update an existing Account record by id. */
  updateAccount: (id: string, input: UpdateAccountInput) => Promise<void>;
  /** Soft-delete an Account record by id. */
  deleteAccount: (id: string) => Promise<void>;
  /** Whether a write operation is in progress. */
  isSaving: boolean;
  /** Last error, if any. */
  error: Error | null;
}

export function useAccountCRUD(): UseAccountCRUDResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAccount = useCallback(async (input: CreateAccountInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const collection = database.get<Account>('accounts') as Collection<Account>;
        await collection.create((record) => {
          setRaw(record, {
            name: input.name,
            type: input.type,
            cut_off_day: input.cutOffDay ?? null,
            payment_day: input.paymentDay ?? null,
            icon: null,
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

  const updateAccount = useCallback(async (id: string, input: UpdateAccountInput) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<Account>('accounts').find(id);
        await record.update((r) => {
          r.name = input.name;
          r.cutOffDay = input.cutOffDay ?? null;
          r.paymentDay = input.paymentDay ?? null;
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

  const deleteAccount = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await database.write(async () => {
        const record = await database.get<Account>('accounts').find(id);
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

  return { createAccount, updateAccount, deleteAccount, isSaving, error };
}
