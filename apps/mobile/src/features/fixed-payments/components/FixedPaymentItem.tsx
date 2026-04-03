import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Check } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatShortDate } from '@/shared/utils/formatters';

import type { FixedPaymentData } from '../hooks/useFixedPaymentsData';

interface FixedPaymentItemProps {
  payment: FixedPaymentData;
  month: number;
  year: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function FixedPaymentItem({ payment, month, year, onPress, onLongPress }: FixedPaymentItemProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, radii } = theme.moni;
  const fmt = useFormatCurrency();

  const dueDate = new Date(year, month - 1, payment.paymentDay);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      testID={`fixed-payment-item-${payment.id}`}
    >
      {payment.isPaid && (
        <View style={[styles.paidDot, { backgroundColor: colors.positive, marginRight: spacing.sm }]}>
          <Check size={12} color={colors.onPositive} strokeWidth={3} />
        </View>
      )}

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: payment.isPaid ? colors.mutedForeground : colors.cardForeground,
            },
          ]}
        >
          {payment.name}
        </Text>
        <Text style={[styles.dueDate, { color: colors.mutedForeground }]}>
          {t('fixedPayments.due')} {formatShortDate(dueDate)}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          {
            color: payment.isPaid ? colors.mutedForeground : colors.cardForeground,
            textDecorationLine: payment.isPaid ? 'line-through' : 'none',
          },
        ]}
      >
        {fmt(payment.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
