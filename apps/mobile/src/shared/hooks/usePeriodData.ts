import { useState, useEffect } from 'react';
import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Income } from '@/database/models/Income';
import type { FixedPayment } from '@/database/models/FixedPayment';
import type { Transaction } from '@/database/models/Transaction';
import type { Installment } from '@/database/models/Installment';
import type { Category } from '@/database/models/Category';
import type { Account } from '@/database/models/Account';

export interface PeriodIncome {
  expectedAmount: number;
  actualAmount: number | null;
}

export interface PeriodFixedPayment {
  id: string;
  name: string;
  budgetedAmount: number;
  actualAmount: number | null;
  paymentDay: number;
  isPaid: boolean;
}

export interface PeriodTransaction {
  id: string;
  totalAmount: number;
  myAmount: number;
  description: string;
  date: number;
  categoryId: string;
  accountId: string;
  totalInstallments: number;
  isSubscription: boolean;
  note: string | null;
}

export interface PeriodInstallment {
  id: string;
  transactionId: string;
  accountId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  isPaid: boolean;
}

export interface PeriodCategory {
  id: string;
  name: string;
  type: string;
  monthlyBudget: number;
  icon: string | null;
  color: string | null;
}

export interface PeriodAccount {
  id: string;
  name: string;
  type: string;
}

export interface PeriodData {
  incomes: PeriodIncome[];
  fixedPayments: PeriodFixedPayment[];
  transactions: PeriodTransaction[];
  installments: PeriodInstallment[];
  categories: PeriodCategory[];
  accounts: PeriodAccount[];
  isLoading: boolean;
}

export function usePeriodData(year: number, month: number): PeriodData {
  const [incomes, setIncomes] = useState<PeriodIncome[]>([]);
  const [fixedPayments, setFixedPayments] = useState<PeriodFixedPayment[]>([]);
  const [transactions, setTransactions] = useState<PeriodTransaction[]>([]);
  const [installments, setInstallments] = useState<PeriodInstallment[]>([]);
  const [categories, setCategories] = useState<PeriodCategory[]>([]);
  const [accounts, setAccounts] = useState<PeriodAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData(): Promise<void> {
      setIsLoading(true);

      const [
        rawIncomes,
        rawFixedPayments,
        rawTransactions,
        rawInstallments,
        rawCategories,
        rawAccounts,
      ] = await Promise.all([
        database
          .get<Income>('incomes')
          .query(
            Q.where('period_year', year),
            Q.where('period_month', month),
          )
          .fetch(),
        database
          .get<FixedPayment>('fixed_payments')
          .query(
            Q.where('period_year', year),
            Q.where('period_month', month),
          )
          .fetch(),
        database
          .get<Transaction>('transactions')
          .query(
            Q.where('period_year', year),
            Q.where('period_month', month),
          )
          .fetch(),
        database
          .get<Installment>('installments')
          .query(
            Q.where('due_year', year),
            Q.where('due_month', month),
          )
          .fetch(),
        database
          .get<Category>('categories')
          .query(Q.where('is_active', true))
          .fetch(),
        database
          .get<Account>('accounts')
          .query(Q.where('is_active', true))
          .fetch(),
      ]);

      if (cancelled) {
        return;
      }

      setIncomes(
        rawIncomes.map((i) => ({
          expectedAmount: i.expectedAmount,
          actualAmount: i.actualAmount,
        })),
      );

      setFixedPayments(
        rawFixedPayments.map((fp) => ({
          id: fp.id,
          name: fp.name,
          budgetedAmount: fp.budgetedAmount,
          actualAmount: fp.actualAmount,
          paymentDay: fp.paymentDay,
          isPaid: fp.isPaid,
        })),
      );

      setTransactions(
        rawTransactions.map((tx) => ({
          id: tx.id,
          totalAmount: tx.totalAmount,
          myAmount: tx.myAmount,
          description: tx.description,
          date: tx.transactionDate,
          categoryId: tx.categoryId,
          accountId: tx.accountId,
          totalInstallments: tx.totalInstallments,
          isSubscription: tx.isSubscription,
          note: tx.note,
        })),
      );

      setInstallments(
        rawInstallments.map((inst) => ({
          id: inst.id,
          transactionId: inst.transactionId,
          accountId: inst.accountId,
          installmentNumber: inst.installmentNumber,
          totalInstallments: inst.totalInstallments,
          amount: inst.amount,
          isPaid: inst.isPaid,
        })),
      );

      setCategories(
        rawCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          monthlyBudget: cat.monthlyBudget,
          icon: cat.icon,
          color: cat.color,
        })),
      );

      setAccounts(
        rawAccounts.map((acc) => ({
          id: acc.id,
          name: acc.name,
          type: acc.type,
        })),
      );

      setIsLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  return {
    incomes,
    fixedPayments,
    transactions,
    installments,
    categories,
    accounts,
    isLoading,
  };
}
