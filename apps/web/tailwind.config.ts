import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Moni brand — mirrors packages/ui/src/theme/colors.ts
        primary: {
          DEFAULT: '#003087',
          light: '#1A4DB5',
          dark: '#001F5C',
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCB000',
        },
        secondary: {
          DEFAULT: '#CE1126',
          light: '#E53D52',
          dark: '#9C0D1E',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
};

export default config;
