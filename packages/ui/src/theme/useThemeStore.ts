import { Appearance } from 'react-native';
import { create } from 'zustand';

type ColorScheme = 'dark' | 'light';

interface ThemeState {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  colorScheme: (Appearance.getColorScheme() as ColorScheme) ?? 'dark',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark',
    })),
}));
