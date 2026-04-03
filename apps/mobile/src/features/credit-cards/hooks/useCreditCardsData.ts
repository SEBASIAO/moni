import { useMemo } from 'react';

import { usePeriodStore } from '@/shared/store/periodStore';
import { usePeriodData } from '@/shared/hooks/usePeriodData';
import type { PeriodInstallment, PeriodTransaction } from '@/shared/hooks/usePeriodData';

interface CreditCardTransaction {
  id: string;
  description: string;
  amount: number;
}

interface CreditCardInstallment {
  id: string;
  description: string;
  amount: number;
  installmentNumber: number;
  totalInstallments: number;
}

interface CreditCardSection {
  subscriptions: CreditCardTransaction[];
  installments: CreditCardInstallment[];
  purchases: CreditCardTransaction[];
}

export interface CreditCardData {
  id: string;
  name: string;
  total: number;
  sections: CreditCardSection;
}

export interface CreditCardsResult {
  cards: CreditCardData[];
  grandTotal: number;
}

/**
 * Returns credit card data grouped by card with subscriptions,
 * installments, and one-time purchases for the current month.
 * Queries WatermelonDB for real transaction and installment data.
 */
export function useCreditCardsData(): CreditCardsResult {
  const month = usePeriodStore((s) => s.month);
  const year = usePeriodStore((s) => s.year);

  const { transactions, installments, accounts } = usePeriodData(year, month);

  // Group transactions by credit card accountId
  const transactionsByCard = useMemo(() => {
    const map = new Map<string, PeriodTransaction[]>();
    const creditCardIds = new Set<string>();
    for (const acc of accounts) {
      if (acc.type === 'credit_card') {
        creditCardIds.add(acc.id);
      }
    }
    for (const tx of transactions) {
      if (creditCardIds.has(tx.accountId)) {
        const list = map.get(tx.accountId) ?? [];
        list.push(tx);
        map.set(tx.accountId, list);
      }
    }
    return map;
  }, [transactions, accounts]);

  // Group installments by credit card accountId
  const installmentsByCard = useMemo(() => {
    const map = new Map<string, PeriodInstallment[]>();
    const creditCardIds = new Set<string>();
    for (const acc of accounts) {
      if (acc.type === 'credit_card') {
        creditCardIds.add(acc.id);
      }
    }
    for (const inst of installments) {
      if (creditCardIds.has(inst.accountId)) {
        const list = map.get(inst.accountId) ?? [];
        list.push(inst);
        map.set(inst.accountId, list);
      }
    }
    return map;
  }, [installments, accounts]);

  const cards: CreditCardData[] = useMemo(() => {
    const creditCardAccounts = accounts.filter((acc) => acc.type === 'credit_card');

    return creditCardAccounts.map((acc) => {
      const cardTransactions = transactionsByCard.get(acc.id) ?? [];
      const cardInstallments = installmentsByCard.get(acc.id) ?? [];

      const subscriptions: CreditCardTransaction[] = [];
      const purchases: CreditCardTransaction[] = [];

      for (const tx of cardTransactions) {
        if (tx.isSubscription) {
          subscriptions.push({
            id: tx.id,
            description: tx.description,
            amount: tx.myAmount,
          });
        } else if (tx.totalInstallments <= 1) {
          purchases.push({
            id: tx.id,
            description: tx.description,
            amount: tx.myAmount,
          });
        }
        // Transactions with totalInstallments > 1 are handled via the installments table
      }

      const installmentItems: CreditCardInstallment[] = cardInstallments.map((inst) => ({
        id: inst.id,
        description: inst.description,
        amount: inst.amount,
        installmentNumber: inst.installmentNumber,
        totalInstallments: inst.totalInstallments,
      }));

      const subscriptionsTotal = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      const installmentsTotal = installmentItems.reduce((sum, i) => sum + i.amount, 0);
      const purchasesTotal = purchases.reduce((sum, p) => sum + p.amount, 0);
      const total = subscriptionsTotal + installmentsTotal + purchasesTotal;

      return {
        id: acc.id,
        name: acc.name,
        total,
        sections: {
          subscriptions,
          installments: installmentItems,
          purchases,
        },
      };
    });
  }, [accounts, transactionsByCard, installmentsByCard]);

  const grandTotal = useMemo(
    () => cards.reduce((sum, card) => sum + card.total, 0),
    [cards],
  );

  return { cards, grandTotal };
}
