/**
 * Brand color palette for Moni.
 * Inspired by the Colombian flag: yellow, blue, red — extended with neutrals.
 */
export const colors = {
  // Brand primary
  primary: '#003087', // Deep blue (Colombia flag)
  primaryLight: '#1A4DB5',
  primaryDark: '#001F5C',

  // Brand accent
  accent: '#FFD700', // Golden yellow (Colombia flag)
  accentLight: '#FFE44D',
  accentDark: '#CCB000',

  // Brand secondary
  secondary: '#CE1126', // Red (Colombia flag)
  secondaryLight: '#E53D52',
  secondaryDark: '#9C0D1E',

  // Neutrals
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#EEEEEE',
  outline: '#E0E0E0',

  // Text
  onPrimary: '#FFFFFF',
  onAccent: '#000000',
  onBackground: '#1C1B1F',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',

  // Semantic
  success: '#2E7D32',
  warning: '#F57F17',
  error: '#B00020',
  info: '#0288D1',

  // Grayscale
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
