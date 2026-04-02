import React from 'react';

import { initI18n } from '@/shared/i18n';

import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';

initI18n();

export function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
