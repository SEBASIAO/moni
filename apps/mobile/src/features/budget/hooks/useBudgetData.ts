import { useMemo } from 'react';

import { usePeriodStore } from '@/shared/store/periodStore';
import { usePeriodData } from '@/shared/hooks/usePeriodData';
import { useTransactionAggregates } from '@/shared/hooks/useTransactionAggregates';

export interface BudgetCategoryData {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  creditCardAmount: number;
}

export interface BudgetResult {
  categories: BudgetCategoryData[];
  totalBudgeted: number;
  totalSpent: number;
  month: number;
  year: number;
}

const DEFAULT_ICON = 'shape-outline';

/**
 * Returns budget data for the current month with per-category
 * budget vs spent and credit card breakdowns.
 * Queries WatermelonDB for real transaction data.
 */
export function useBudgetData(): BudgetResult {
  const month = usePeriodStore((s) => s.month);
  const year = usePeriodStore((s) => s.year);

  const { transactions, categories: periodCategories, accounts } = usePeriodData(year, month);
  const aggregates = useTransactionAggregates(transactions, periodCategories, accounts);

  // Build a set of credit card account IDs for credit card amount calculation
  const creditCardAccountIds = useMemo(() => {
    const ids = new Set<string>();
    for (const acc of accounts) {
      if (acc.type === 'credit_card') {
        ids.add(acc.id);
      }
    }
    return ids;
  }, [accounts]);

  // Per-category credit card spending
  const creditCardByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (creditCardAccountIds.has(tx.accountId)) {
        const current = map.get(tx.categoryId) ?? 0;
        map.set(tx.categoryId, current + tx.myAmount);
      }
    }
    return map;
  }, [transactions, creditCardAccountIds]);

  const categories: BudgetCategoryData[] = useMemo(() => {
    const result: BudgetCategoryData[] = periodCategories
      .map((cat) => {
        const spent = aggregates.byCategory.get(cat.id) ?? 0;
        const creditCardAmount = creditCardByCategory.get(cat.id) ?? 0;
        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon ?? DEFAULT_ICON,
          budget: cat.monthlyBudget,
          spent,
          creditCardAmount,
        };
      });

    // Sort: over-budget first, then by percentage descending
    result.sort((a, b) => {
      const aOver = a.spent > a.budget ? 1 : 0;
      const bOver = b.spent > b.budget ? 1 : 0;
      if (aOver !== bOver) {
        return bOver - aOver;
      }
      const aPct = a.budget > 0 ? a.spent / a.budget : 0;
      const bPct = b.budget > 0 ? b.spent / b.budget : 0;
      return bPct - aPct;
    });

    return result;
  }, [periodCategories, aggregates.byCategory, creditCardByCategory]);

  const totalBudgeted = useMemo(
    () => categories.reduce((sum, c) => sum + c.budget, 0),
    [categories],
  );

  const totalSpent = useMemo(
    () => categories.reduce((sum, c) => sum + c.spent, 0),
    [categories],
  );

  return { categories, totalBudgeted, totalSpent, month, year };
}
