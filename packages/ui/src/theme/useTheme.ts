import { useMemo } from 'react';

import { moniDarkTheme, moniLightTheme } from './theme';
import { useThemeStore } from './useThemeStore';

/**
 * Returns the active Moni theme based on the current color scheme.
 * Use `theme.moni.colors`, `theme.moni.spacing`, `theme.moni.typography`, `theme.moni.radii`.
 */
export function useTheme() {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  return useMemo(
    () => (colorScheme === 'dark' ? moniDarkTheme : moniLightTheme),
    [colorScheme],
  );
}
