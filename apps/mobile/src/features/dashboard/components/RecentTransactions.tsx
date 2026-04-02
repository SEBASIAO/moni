import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatShortDate } from '@/shared/utils/formatters';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

interface RecentTransactionsProps {
  transactions: readonly Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, radii } = useTheme().moni;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      <Text style={[typo.sectionHeader, { color: colors.foreground, marginBottom: spacing.sm }]}>
        {t('dashboard.recentTransactions')}
      </Text>

      <View
        style={[
          styles.list,
          {
            backgroundColor: colors.card,
            borderRadius: radii.lg,
          },
        ]}
      >
        {transactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            isLast={index === transactions.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  isLast: boolean;
}

function TransactionRow({ transaction, isLast }: TransactionRowProps) {
  const { colors, typography: typo, spacing } = useTheme().moni;
  const fmt = useFormatCurrency();

  const isExpense = transaction.amount < 0;
  const amountColor = isExpense ? colors.destructive : colors.positive;
  const parsedDate = new Date(transaction.date);

  return (
    <View
      testID={`transaction-${transaction.id}`}
      style={[
        styles.row,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 4,
          borderBottomColor: isLast ? 'transparent' : colors.border,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <Text style={[typo.body, { color: colors.cardForeground }]}>
          {transaction.description}
        </Text>
        <Text style={[typo.caption, { color: colors.mutedForeground }]}>
          {transaction.category} · {formatShortDate(parsedDate)}
        </Text>
      </View>

      <Text style={[typo.amountSmall, styles.rowAmount, { color: amountColor }]}>
        {fmt(transaction.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  list: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowAmount: {
    fontVariant: ['tabular-nums'],
  },
});
