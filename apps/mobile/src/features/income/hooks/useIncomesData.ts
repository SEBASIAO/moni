import { useMemo } from 'react';

import { usePeriodStore } from '@/shared/store/periodStore';
import { usePeriodData } from '@/shared/hooks/usePeriodData';

export interface IncomeData {
  id: string;
  name: string;
  expectedAmount: number;
  actualAmount: number | null;
  frequency: string;
}

export interface IncomesResult {
  incomes: IncomeData[];
  totalExpected: number;
  totalReceived: number;
  month: number;
  year: number;
}

export function useIncomesData(): IncomesResult {
  const month = usePeriodStore((s) => s.month);
  const year = usePeriodStore((s) => s.year);

  const { incomes: rawIncomes } = usePeriodData(year, month);

  const incomes: IncomeData[] = useMemo(
    () =>
      rawIncomes.map((i) => ({
        id: i.id,
        name: i.name,
        expectedAmount: i.expectedAmount,
        actualAmount: i.actualAmount,
        frequency: i.frequency,
      })),
    [rawIncomes],
  );

  const totalExpected = useMemo(
    () => incomes.reduce((sum, i) => sum + i.expectedAmount, 0),
    [incomes],
  );

  const totalReceived = useMemo(
    () =>
      incomes.reduce(
        (sum, i) => sum + (i.actualAmount ?? i.expectedAmount),
        0,
      ),
    [incomes],
  );

  return { incomes, totalExpected, totalReceived, month, year };
}
