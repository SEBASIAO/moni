import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

import { FixedPaymentItem } from '../components/FixedPaymentItem';
import { useFixedPaymentsData } from '../hooks/useFixedPaymentsData';

export function FixedPaymentsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing } = theme.moni;
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { payments, totalPaid, totalPending, month, year } = useFixedPaymentsData();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { padding: spacing.md }]}
    >
      <Text
        style={[
          typography.sectionHeader,
          { color: colors.foreground, marginBottom: spacing.xs },
        ]}
      >
        {t('fixedPayments.title')}
      </Text>
      <Text
        style={[
          styles.monthLabel,
          { color: colors.mutedForeground, marginBottom: spacing.lg },
        ]}
      >
        {t(`months.${month}`)}
      </Text>

      <View style={[styles.summaryRow, { marginBottom: spacing.lg }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            {t('fixedPayments.paid')}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.positive }]}>
            {fmt(totalPaid)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            {t('fixedPayments.pending')}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.mutedForeground }]}>
            {fmt(totalPending)}
          </Text>
        </View>
      </View>

      {payments.map((payment) => (
        <FixedPaymentItem
          key={payment.id}
          payment={payment}
          month={month}
          year={year}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
});
