import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatShortDate } from '@/shared/utils/formatters';

import type { FixedPaymentData } from '../hooks/useFixedPaymentsData';

interface FixedPaymentItemProps {
  payment: FixedPaymentData;
  month: number;
  year: number;
}

const CHECKBOX_SIZE = 24;

export function FixedPaymentItem({ payment, month, year }: FixedPaymentItemProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, radii } = theme.moni;
  const fmt = useFormatCurrency();

  const dueDate = new Date(year, month - 1, payment.paymentDay);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={[styles.checkbox, { marginRight: spacing.sm }]}>
        {payment.isPaid ? (
          <View
            style={[
              styles.checkedCircle,
              { backgroundColor: colors.positive },
            ]}
          >
            <Icon name="check" size={14} color={colors.onPositive} />
          </View>
        ) : (
          <View
            style={[
              styles.uncheckedCircle,
              { borderColor: colors.mutedForeground },
            ]}
          />
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            { color: colors.cardForeground },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_SIZE / 2,
    borderWidth: 2,
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
