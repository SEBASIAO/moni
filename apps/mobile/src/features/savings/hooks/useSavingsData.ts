import { useEffect, useState } from 'react';

import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Saving } from '@/database/models/Saving';
import type { Transaction } from '@/database/models/Transaction';

export interface SavingData {
  id: string;
  name: string;
  targetAmount: number | null;
  currentAmount: number;
  icon: string | null;
  color: string | null;
  linkedCategoryId: string;
  linkedAccountId: string;
}

export interface SavingsDataResult {
  savings: SavingData[];
  totalSaved: number;
  isLoading: boolean;
}

/**
 * Queries all active savings and computes each balance from:
 *   base (current_amount) + deposits (tx with savings category) - withdrawals (tx with savings account)
 *
 * Subscribes to both `savings` and `transactions` tables so the UI updates
 * when a linked transaction is created, edited, or deleted externally.
 */
export function useSavingsData(): SavingsDataResult {
  const [savings, setSavings] = useState<SavingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const records = await database
        .get<Saving>('savings')
        .query(Q.where('is_active', true))
        .fetch();

      if (cancelled) return;

      if (records.length === 0) {
        setSavings([]);
        setIsLoading(false);
        return;
      }

      const categoryIds = records.map((s) => s.linkedCategoryId);
      const accountIds = records.map((s) => s.linkedAccountId);

      // Deposits = transactions whose category is a savings category
      const depositTxs = await database
        .get<Transaction>('transactions')
        .query(Q.where('category_id', Q.oneOf(categoryIds)))
        .fetch();

      // Withdrawals = transactions whose account is a savings account
      const withdrawalTxs = await database
        .get<Transaction>('transactions')
        .query(Q.where('account_id', Q.oneOf(accountIds)))
        .fetch();

      if (cancelled) return;

      const depositsByCat = new Map<string, number>();
      for (const tx of depositTxs) {
        depositsByCat.set(tx.categoryId, (depositsByCat.get(tx.categoryId) ?? 0) + tx.myAmount);
      }

      const withdrawalsByAcc = new Map<string, number>();
      for (const tx of withdrawalTxs) {
        withdrawalsByAcc.set(tx.accountId, (withdrawalsByAcc.get(tx.accountId) ?? 0) + tx.myAmount);
      }

      const mapped = records.map((s) => {
        const deposits = depositsByCat.get(s.linkedCategoryId) ?? 0;
        const withdrawals = withdrawalsByAcc.get(s.linkedAccountId) ?? 0;
        return {
          id: s.id,
          name: s.name,
          targetAmount: s.targetAmount,
          currentAmount: s.currentAmount + deposits - withdrawals,
          icon: s.icon,
          color: s.color,
          linkedCategoryId: s.linkedCategoryId,
          linkedAccountId: s.linkedAccountId,
        };
      });

      if (!cancelled) {
        setSavings(mapped);
        setIsLoading(false);
      }
    }

    const sub = database
      .withChangesForTables(['savings', 'transactions'])
      .subscribe(() => {
        fetchData();
      });

    fetchData();

    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, []);

  const totalSaved = savings.reduce((sum, s) => sum + s.currentAmount, 0);

  return { savings, totalSaved, isLoading };
}
