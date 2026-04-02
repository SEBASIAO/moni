/**
 * Moni color tokens.
 * Orange brand (#F97316) from the Moni logo + profit green.
 */

export const darkColors = {
  primary: '#F97316',
  onPrimary: '#FFFFFF',
  secondary: '#EA580C',
  positive: '#059669',
  onPositive: '#FFFFFF',
  background: '#0F172A',
  foreground: '#FFFFFF',
  card: '#192134',
  cardForeground: '#FFFFFF',
  muted: '#101A34',
  mutedForeground: '#94A3B8',
  border: 'rgba(255,255,255,0.08)',
  destructive: '#DC2626',
  onDestructive: '#FFFFFF',
  warning: '#FBBF24',
  transparent: 'transparent',
} as const;

export const lightColors = {
  primary: '#F97316',
  onPrimary: '#FFFFFF',
  secondary: '#EA580C',
  positive: '#059669',
  onPositive: '#FFFFFF',
  background: '#FFFBF7',
  foreground: '#1C1917',
  card: '#FFFFFF',
  cardForeground: '#1C1917',
  muted: '#F5F0EB',
  mutedForeground: '#78716C',
  border: '#E7E5E4',
  destructive: '#DC2626',
  onDestructive: '#FFFFFF',
  warning: '#FBBF24',
  transparent: 'transparent',
} as const;

export type ColorTokens = typeof darkColors;
export type ColorKey = keyof ColorTokens;
