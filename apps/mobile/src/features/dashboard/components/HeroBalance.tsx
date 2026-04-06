import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

interface HeroBalanceProps {
  /** Available after all planned obligations */
  disponibleReal: number;
  isDisponiblePositive: boolean;
  /** Current balance based on actual transactions */
  saldoActual: number;
  isSaldoPositive: boolean;
}

export function HeroBalance({
  disponibleReal,
  isDisponiblePositive,
  saldoActual,
  isSaldoPositive,
}: HeroBalanceProps) {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing } = useTheme().moni;
  const fmt = useFormatCurrency();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      {/* Primary: disponible real */}
      <Text
        testID="hero-label"
        style={[typo.label, { color: colors.mutedForeground }]}
      >
        {t('dashboard.disponibleReal')}
      </Text>
      <Text
        testID="hero-balance"
        style={[
          typo.hero,
          styles.primaryAmount,
          { color: isDisponiblePositive ? colors.positive : colors.destructive },
        ]}
      >
        {fmt(disponibleReal)}
      </Text>

      {/* Secondary: saldo actual */}
      <Text
        testID="hero-saldo-label"
        style={[styles.secondaryLabel, { color: colors.mutedForeground, marginTop: spacing.sm }]}
      >
        {t('dashboard.saldoActual')}
      </Text>
      <Text
        testID="hero-saldo"
        style={[
          styles.secondaryAmount,
          { color: isSaldoPositive ? colors.foreground : colors.destructive },
        ]}
      >
        {fmt(saldoActual)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  primaryAmount: {
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  secondaryLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  secondaryAmount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
});
