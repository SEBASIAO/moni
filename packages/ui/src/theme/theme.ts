import { MD3LightTheme } from 'react-native-paper';

import { colors } from './colors';

/**
 * Moni brand theme for React Native Paper.
 * Based on Material Design 3 (MD3) light theme.
 */
export const moniTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    onPrimary: colors.onPrimary,
    onPrimaryContainer: colors.onPrimary,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    onSecondary: colors.onPrimary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onBackground: colors.onBackground,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    outline: colors.outline,
    error: colors.error,
  },
};

export type MoniTheme = typeof moniTheme;
