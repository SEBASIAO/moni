import { useCallback } from 'react';

import { useCurrencyStore } from '@/shared/store/currencyStore';

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currencyCode: string): Intl.NumberFormat {
  const cached = formatterCache.get(currencyCode);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  formatterCache.set(currencyCode, formatter);
  return formatter;
}

export function useFormatCurrency(): (amount: number) => string {
  const currencyCode = useCurrencyStore((s) => s.currencyCode);

  return useCallback(
    (amount: number) => getFormatter(currencyCode).format(amount),
    [currencyCode],
  );
}
