import React, { useEffect, useRef } from 'react';
import {
  DefaultTheme,
  DarkTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/shared/hooks/useTheme';

import { OnboardingScreen } from '@/features/onboarding/screens/OnboardingScreen';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { useGenerateMonthlyTransactions } from '@/features/recurring/hooks/useGenerateMonthlyTransactions';

import { AppNavigator } from './AppNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const theme = useTheme();
  const baseNavTheme = theme.dark ? DarkTheme : DefaultTheme;
  const { generate } = useGenerateMonthlyTransactions();
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (isOnboarded && !hasGenerated.current) {
      hasGenerated.current = true;
      const now = new Date();
      void generate(now.getFullYear(), now.getMonth() + 1);
    }
  }, [isOnboarded, generate]);

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
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
