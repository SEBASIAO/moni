import { create } from 'zustand';

const now = new Date();

interface PeriodState {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

export const usePeriodStore = create<PeriodState>()((set) => ({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
}));
