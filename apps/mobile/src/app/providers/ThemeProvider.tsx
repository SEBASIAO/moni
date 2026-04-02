import React from 'react';
import { PaperProvider } from 'react-native-paper';

import { moniTheme } from '@moni/ui/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <PaperProvider theme={moniTheme}>{children}</PaperProvider>;
}
