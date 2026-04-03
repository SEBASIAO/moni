import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import { darkColors, lightColors } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';
import { typography } from './typography';

/**
 * Moni dark theme (default).
 */
export const moniDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    onPrimary: darkColors.onPrimary,
    secondary: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.card,
    surfaceVariant: darkColors.muted,
    onBackground: darkColors.foreground,
    onSurface: darkColors.cardForeground,
    onSurfaceVariant: darkColors.mutedForeground,
    outline: darkColors.border,
    error: darkColors.destructive,
    onError: darkColors.onDestructive,
  },
  moni: {
    colors: darkColors,
    spacing,
    typography,
    radii,
  },
} as const;

/**
 * Moni light theme.
 */
export const moniLightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    onPrimary: lightColors.onPrimary,
    secondary: lightColors.secondary,
    background: lightColors.background,
    surface: lightColors.card,
    surfaceVariant: lightColors.muted,
    onBackground: lightColors.foreground,
    onSurface: lightColors.cardForeground,
    onSurfaceVariant: lightColors.mutedForeground,
    outline: lightColors.border,
    error: lightColors.destructive,
    onError: lightColors.onDestructive,
  },
  moni: {
    colors: lightColors,
    spacing,
    typography,
    radii,
  },
} as const;

export type MoniTheme = typeof moniDarkTheme;
