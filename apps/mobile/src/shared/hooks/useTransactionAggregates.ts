import { useMemo } from 'react';

import type { PeriodTransaction, PeriodCategory, PeriodAccount } from './usePeriodData';

export interface TransactionAggregates {
  /** Sum of myAmount grouped by categoryId */
  byCategory: Map<string, number>;
  /** Sum of myAmount where account type is 'credit_card', grouped by accountId */
  byCreditCard: Map<string, number>;
  /** Total myAmount where category type is 'variable' */
  totalVariable: number;
  /** Total myAmount where category type is 'savings' */
  totalSavings: number;
}

export function useTransactionAggregates(
  transactions: PeriodTransaction[],
  categories: PeriodCategory[],
  accounts: PeriodAccount[],
): TransactionAggregates {
  return useMemo(() => {
    const categoryTypeMap = new Map<string, string>();
    for (const cat of categories) {
      categoryTypeMap.set(cat.id, cat.type);
    }

    const creditCardAccountIds = new Set<string>();
    for (const acc of accounts) {
      if (acc.type === 'credit_card') {
        creditCardAccountIds.add(acc.id);
      }
    }

    const byCategory = new Map<string, number>();
    const byCreditCard = new Map<string, number>();
    let totalVariable = 0;
    let totalSavings = 0;

    for (const tx of transactions) {
      // Group by category
      const currentCatTotal = byCategory.get(tx.categoryId) ?? 0;
      byCategory.set(tx.categoryId, currentCatTotal + tx.myAmount);

      // Group by credit card
      if (creditCardAccountIds.has(tx.accountId)) {
        const currentCardTotal = byCreditCard.get(tx.accountId) ?? 0;
        byCreditCard.set(tx.accountId, currentCardTotal + tx.myAmount);
      }

      // Sum by category type
      const catType = categoryTypeMap.get(tx.categoryId);
      if (catType === 'variable') {
        totalVariable += tx.myAmount;
      } else if (catType === 'savings') {
        totalSavings += tx.myAmount;
      }
    }

    return { byCategory, byCreditCard, totalVariable, totalSavings };
  }, [transactions, categories, accounts]);
}
