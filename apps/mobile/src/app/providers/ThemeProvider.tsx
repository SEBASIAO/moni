import React from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useTheme();

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.moni.colors.background}
      />
      {children}
    </PaperProvider>
  );
}
