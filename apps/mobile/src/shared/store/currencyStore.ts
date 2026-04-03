import { create } from 'zustand';

import { DEFAULT_CURRENCY_CODE } from '@/shared/constants/currencies';

interface CurrencyState {
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currencyCode: DEFAULT_CURRENCY_CODE,
  setCurrencyCode: (code) => set({ currencyCode: code }),
}));
