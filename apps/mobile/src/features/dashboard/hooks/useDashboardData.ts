import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePeriodStore } from '@/shared/store/periodStore';
import { usePeriodData } from '@/shared/hooks/usePeriodData';
import type { PeriodCategory, PeriodAccount, PeriodFixedPayment } from '@/shared/hooks/usePeriodData';
import { useTransactionAggregates } from '@/shared/hooks/useTransactionAggregates';

interface Transaction {
  id: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  date: number;
  note: string | null;
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
  /** Available after all planned obligations (budgets + fixed + savings + installments) */
  disponibleReal: number;
  isDisponiblePositive: boolean;
  /** Current balance based on actual transactions */
  saldoActual: number;
  isSaldoPositive: boolean;
  income: number;
  expenses: number;
  quickCards: readonly QuickCardData[];
  recentTransactions: readonly Transaction[];
  categories: PeriodCategory[];
  accounts: PeriodAccount[];
  fixedPayments: PeriodFixedPayment[];
  isLoading: boolean;
}

/**
 * Provides all data for the Dashboard screen.
 * Queries WatermelonDB for the selected period and computes
 * the "Disponible Real" (real available balance).
 */
export function useDashboardData(): DashboardData {
  const { t } = useTranslation();
  const month = usePeriodStore((s) => s.month);
  const year = usePeriodStore((s) => s.year);
  const setMonth = usePeriodStore((s) => s.setMonth);
  const setYear = usePeriodStore((s) => s.setYear);

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

  // Per category: deduct the GREATER of budget vs actual spent
  // Within budget → deducts budget (obligation is reserved)
  // Over budget  → deducts actual (excess eats into available)
  const totalCategoryObligations = useMemo(() => {
    let total = 0;
    for (const cat of categories) {
      if (cat.type !== 'variable') continue;
      const spent = aggregates.byCategory.get(cat.id) ?? 0;
      total += Math.max(cat.monthlyBudget, spent);
    }
    return total;
  }, [categories, aggregates.byCategory]);

  // Primary: what's truly free after ALL planned obligations
  const disponibleReal =
    totalIncome
    - totalCategoryObligations
    - fixedTotal
    - aggregates.totalSavings
    - installmentsDue;

  const isDisponiblePositive = disponibleReal >= 0;

  // Secondary: what you currently have based on actual transactions
  const saldoActual =
    totalIncome
    - fixedPaymentsTotalPaid
    - aggregates.totalVariable
    - aggregates.totalSavings
    - installmentsDue;

  const isSaldoPositive = saldoActual >= 0;

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
      {
        id: 'savings',
        title: t('dashboard.savings'),
        amount: aggregates.totalSavings,
        label: t('dashboard.savingsLabel'),
      },
    ],
    [totalIncome, aggregates.totalVariable, aggregates.totalSavings, fixedTotal, pendingCount, tcTotal, cardCount, t],
  );

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const acc of accounts) {
      map.set(acc.id, acc.name);
    }
    return map;
  }, [accounts]);

  const recentTransactions: readonly Transaction[] = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => b.date - a.date);
    return sorted.slice(0, 5).map((tx) => ({
      id: tx.id,
      description: tx.description,
      category: categoryNameMap.get(tx.categoryId) ?? '',
      account: accountNameMap.get(tx.accountId) ?? '',
      amount: -tx.myAmount,
      date: tx.date,
      note: tx.note,
    }));
  }, [transactions, categoryNameMap, accountNameMap]);

  return {
    month,
    year,
    setMonth,
    setYear,
    disponibleReal,
    isDisponiblePositive,
    saldoActual,
    isSaldoPositive,
    income: totalIncome,
    expenses: totalExpenses,
    quickCards,
    recentTransactions,
    categories,
    accounts,
    fixedPayments,
    isLoading,
  };
}
