import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

interface HeroBalanceProps {
  balance: number;
  isPositive: boolean;
}

export function HeroBalance({ balance, isPositive }: HeroBalanceProps) {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing } = useTheme().moni;
  const fmt = useFormatCurrency();

  const heroColor = isPositive ? colors.positive : colors.destructive;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      <Text
        testID="hero-label"
        style={[typo.label, { color: colors.mutedForeground }]}
      >
        {t('dashboard.availableToSpend')}
      </Text>
      <Text
        testID="hero-balance"
        style={[typo.hero, styles.amount, { color: heroColor }]}
      >
        {fmt(balance)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  amount: {
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
});
