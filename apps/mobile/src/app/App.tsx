import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { initDatabase } from '@/database';
import { initI18n } from '@/shared/i18n';

import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';

initI18n();

export function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    // Splash screen is still visible — just render empty view
    return <View style={{ flex: 1 }} />;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
