import { useMemo } from 'react';

import { moniDarkTheme, moniLightTheme } from '@moni/ui/theme';

import { useThemeStore } from './useThemeStore';

/**
 * Returns the active Moni theme based on the current color scheme.
 * Local copy to avoid duplicate React instances from @moni/ui hooks.
 */
export function useTheme() {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  return useMemo(
    () => (colorScheme === 'dark' ? moniDarkTheme : moniLightTheme),
    [colorScheme],
  );
}
