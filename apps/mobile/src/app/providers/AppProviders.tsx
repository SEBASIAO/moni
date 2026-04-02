import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all app-level providers in the correct order.
 * Add new providers here — keep the tree shallow by avoiding nesting.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
