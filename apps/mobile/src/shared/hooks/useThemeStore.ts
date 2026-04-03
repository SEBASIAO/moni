import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ColorScheme = 'dark' | 'light';
type ThemePreference = 'dark' | 'light' | 'system';

interface ThemeState {
  /** User preference: 'system' follows OS, 'dark'/'light' is manual override. */
  preference: ThemePreference;
  /** Resolved color scheme (what the app actually renders). */
  colorScheme: ColorScheme;
  setPreference: (pref: ThemePreference) => void;
}

function resolveScheme(preference: ThemePreference): ColorScheme {
  if (preference === 'system') {
    return (Appearance.getColorScheme() as ColorScheme) ?? 'dark';
  }
  return preference;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      colorScheme: resolveScheme('system'),
      setPreference: (pref) =>
        set({ preference: pref, colorScheme: resolveScheme(pref) }),
    }),
    {
      name: 'moni-theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Re-resolve after hydration in case OS scheme changed while app was closed
        if (state != null) {
          state.colorScheme = resolveScheme(state.preference);
        }
      },
    },
  ),
);

// Listen for OS appearance changes and update if preference is 'system'
Appearance.addChangeListener(({ colorScheme }) => {
  const { preference } = useThemeStore.getState();
  if (preference === 'system' && colorScheme != null) {
    useThemeStore.setState({ colorScheme: colorScheme as ColorScheme });
  }
});
