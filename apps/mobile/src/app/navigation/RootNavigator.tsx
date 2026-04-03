import React, { useEffect, useRef, useState } from 'react';
import {
  DefaultTheme,
  DarkTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';

import { useTheme } from '@/shared/hooks/useTheme';
import { useThemeStore } from '@/shared/hooks/useThemeStore';
import { useLanguageStore } from '@/shared/store/languageStore';

import { FixedPaymentsScreen } from '@/features/fixed-payments/screens/FixedPaymentsScreen';
import { IncomesScreen } from '@/features/income/screens/IncomesScreen';
import { TransactionsScreen } from '@/features/transactions/screens/TransactionsScreen';
import { OnboardingScreen } from '@/features/onboarding/screens/OnboardingScreen';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { useGenerateMonthlyTransactions } from '@/features/recurring/hooks/useGenerateMonthlyTransactions';
import { seedDefaults } from '@/database/seed';

import { AppNavigator } from './AppNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const theme = useTheme();
  const baseNavTheme = theme.dark ? DarkTheme : DefaultTheme;
  const { generate } = useGenerateMonthlyTransactions();
  const hasGenerated = useRef(false);
  const hasSeeded = useRef(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const check = () => {
      if (
        useOnboardingStore.persist.hasHydrated() &&
        useThemeStore.persist.hasHydrated() &&
        useLanguageStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };

    // Check immediately
    check();

    // Subscribe to each store's hydration finish
    const unsub1 = useOnboardingStore.persist.onFinishHydration(check);
    const unsub2 = useThemeStore.persist.onFinishHydration(check);
    const unsub3 = useLanguageStore.persist.onFinishHydration(check);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  useEffect(() => {
    if (isOnboarded && !hasGenerated.current) {
      hasGenerated.current = true;
      const now = new Date();
      void generate(now.getFullYear(), now.getMonth() + 1);
    }
  }, [isOnboarded, generate]);

  useEffect(() => {
    if (hydrated && !hasSeeded.current) {
      hasSeeded.current = true;
      void seedDefaults();
    }
  }, [hydrated]);

  useEffect(() => {
    if (hydrated) {
      BootSplash.hide({ fade: true });
    }
  }, [hydrated]);

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        ...baseNavTheme,
        dark: theme.dark,
        colors: {
          ...baseNavTheme.colors,
          primary: theme.moni.colors.primary,
          background: theme.moni.colors.background,
          card: theme.moni.colors.card,
          text: theme.moni.colors.foreground,
          border: theme.moni.colors.border,
          notification: theme.moni.colors.destructive,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isOnboarded ? (
          <>
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="FixedPayments" component={FixedPaymentsScreen} />
            <Stack.Screen name="Incomes" component={IncomesScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
          </>
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
