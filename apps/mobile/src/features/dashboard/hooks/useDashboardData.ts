import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePeriodData } from '@/shared/hooks/usePeriodData';
import { useTransactionAggregates } from '@/shared/hooks/useTransactionAggregates';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

interface QuickCardData {
  id: string;
  title: string;
  amount: number;
  label: string;
}

interface DashboardData {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  balance: number;
  isPositive: boolean;
  income: number;
  expenses: number;
  quickCards: readonly QuickCardData[];
  recentTransactions: readonly Transaction[];
  isLoading: boolean;
}

/**
 * Provides all data for the Dashboard screen.
 * Queries WatermelonDB for the selected period and computes
 * the "Disponible Real" (real available balance).
 */
export function useDashboardData(): DashboardData {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const {
    incomes,
    fixedPayments,
    transactions,
    installments,
    categories,
    accounts,
    isLoading,
  } = usePeriodData(year, month);

  const aggregates = useTransactionAggregates(transactions, categories, accounts);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + (i.actualAmount ?? i.expectedAmount), 0),
    [incomes],
  );

  const fixedPaymentsTotalPaid = useMemo(
    () =>
      fixedPayments
        .filter((fp) => fp.isPaid)
        .reduce((sum, fp) => sum + (fp.actualAmount ?? fp.budgetedAmount), 0),
    [fixedPayments],
  );

  const fixedPaymentsTotalPending = useMemo(
    () =>
      fixedPayments
        .filter((fp) => !fp.isPaid)
        .reduce((sum, fp) => sum + fp.budgetedAmount, 0),
    [fixedPayments],
  );

  const installmentsDue = useMemo(
    () => installments.reduce((sum, inst) => sum + inst.amount, 0),
    [installments],
  );

  const fixedTotal = fixedPaymentsTotalPaid + fixedPaymentsTotalPending;

  const balance =
    totalIncome
    - fixedPaymentsTotalPaid
    - fixedPaymentsTotalPending
    - aggregates.totalVariable
    - aggregates.totalSavings
    - installmentsDue;

  const isPositive = balance >= 0;

  const totalExpenses =
    fixedTotal + aggregates.totalVariable + aggregates.totalSavings + installmentsDue;

  const tcTotal = useMemo(() => {
    let sum = 0;
    for (const amount of aggregates.byCreditCard.values()) {
      sum += amount;
    }
    return sum;
  }, [aggregates.byCreditCard]);

  const pendingCount = useMemo(
    () => fixedPayments.filter((fp) => !fp.isPaid).length,
    [fixedPayments],
  );

  const cardCount = useMemo(() => {
    const creditCardIds = new Set<string>();
    for (const acc of accounts) {
      if (acc.type === 'credit_card') {
        creditCardIds.add(acc.id);
      }
    }
    return creditCardIds.size;
  }, [accounts]);

  const quickCards: readonly QuickCardData[] = useMemo(
    () => [
      {
        id: 'income',
        title: t('dashboard.income'),
        amount: totalIncome,
        label: t('dashboard.currentMonth'),
      },
      {
        id: 'expenses',
        title: t('dashboard.expenses'),
        amount: aggregates.totalVariable,
        label: 'variable',
      },
      {
        id: 'fixed',
        title: t('dashboard.fixed'),
        amount: fixedTotal,
        label: t('dashboard.pendingPayments', { count: pendingCount }),
      },
      {
        id: 'credit',
        title: t('dashboard.cards'),
        amount: tcTotal,
        label: t('dashboard.cardsCount', { count: cardCount }),
      },
    ],
    [totalIncome, aggregates.totalVariable, fixedTotal, pendingCount, tcTotal, cardCount, t],
  );

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const recentTransactions: readonly Transaction[] = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => b.date - a.date);
    return sorted.slice(0, 5).map((tx) => ({
      id: tx.id,
      description: tx.description,
      category: categoryNameMap.get(tx.categoryId) ?? '',
      amount: -tx.myAmount,
      date: new Date(tx.date).toISOString().slice(0, 10),
    }));
  }, [transactions, categoryNameMap]);

  return {
    month,
    year,
    setMonth,
    setYear,
    balance,
    isPositive,
    income: totalIncome,
    expenses: totalExpenses,
    quickCards,
    recentTransactions,
    isLoading,
  };
}
