import { useMemo, useState } from 'react';

import { usePeriodData } from '@/shared/hooks/usePeriodData';

export interface FixedPaymentData {
  id: string;
  name: string;
  amount: number;
  paymentDay: number;
  isPaid: boolean;
}

export interface FixedPaymentsResult {
  payments: FixedPaymentData[];
  totalPaid: number;
  totalPending: number;
  month: number;
  year: number;
}

/**
 * Returns fixed payment data for the current month,
 * sorted with pending items first (by date), then paid items.
 * Queries WatermelonDB for real fixed payment data.
 */
export function useFixedPaymentsData(): FixedPaymentsResult {
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const { fixedPayments } = usePeriodData(year, month);

  const payments: FixedPaymentData[] = useMemo(() => {
    const mapped = fixedPayments.map((fp) => ({
      id: fp.id,
      name: fp.name,
      amount: fp.actualAmount ?? fp.budgetedAmount,
      paymentDay: fp.paymentDay,
      isPaid: fp.isPaid,
    }));

    mapped.sort((a, b) => {
      if (a.isPaid !== b.isPaid) {
        return a.isPaid ? 1 : -1;
      }
      return a.paymentDay - b.paymentDay;
    });

    return mapped;
  }, [fixedPayments]);

  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => !p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  return { payments, totalPaid, totalPending, month, year };
}
