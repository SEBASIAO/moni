import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatShortDate } from '@/shared/utils/formatters';

interface Transaction {
  id: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  date: number;
  note: string | null;
}

interface RecentTransactionsProps {
  transactions: readonly Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
  onSeeAll?: () => void;
}

export function RecentTransactions({ transactions, onTransactionPress, onSeeAll }: RecentTransactionsProps) {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, radii } = useTheme().moni;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      <View style={styles.headerRow}>
        <Text style={[typo.sectionHeader, { color: colors.foreground }]}>
          {t('dashboard.recentTransactions')}
        </Text>
        {onSeeAll != null && (
          <Pressable onPress={onSeeAll} hitSlop={8} testID="see-all-transactions">
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              {t('dashboard.seeAll')}
            </Text>
          </Pressable>
        )}
      </View>

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
            onPress={onTransactionPress ? () => onTransactionPress(tx) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  isLast: boolean;
  onPress?: (() => void) | undefined;
}

function TransactionRow({ transaction, isLast, onPress }: TransactionRowProps) {
  const { colors, typography: typo, spacing } = useTheme().moni;
  const fmt = useFormatCurrency();

  const isExpense = transaction.amount < 0;
  const amountColor = isExpense ? colors.destructive : colors.positive;
  const parsedDate = new Date(transaction.date);

  return (
    <Pressable
      onPress={onPress}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
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
