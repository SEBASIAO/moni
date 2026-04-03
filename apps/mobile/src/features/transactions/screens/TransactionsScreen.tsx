import React, { useCallback, useMemo, useRef, useState } from 'react';
import { usePeriodStore } from '@/shared/store/periodStore';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatShortDate } from '@/shared/utils/formatters';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { TransactionDetailSheet } from '@/features/dashboard/components/TransactionDetailSheet';
import { usePeriodData } from '@/shared/hooks/usePeriodData';

interface TransactionItem {
  id: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  date: number;
  note: string | null;
}

export function TransactionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing } = theme.moni;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();

  const month = usePeriodStore((s) => s.month);
  const year = usePeriodStore((s) => s.year);

  const { transactions, categories, accounts } = usePeriodData(year, month);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const acc of accounts) {
      map.set(acc.id, acc.name);
    }
    return map;
  }, [accounts]);

  const allTransactions: readonly TransactionItem[] = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => b.date - a.date);
    return sorted.map((tx) => ({
      id: tx.id,
      description: tx.description,
      category: categoryNameMap.get(tx.categoryId) ?? '',
      account: accountNameMap.get(tx.accountId) ?? '',
      amount: -tx.myAmount,
      date: tx.date,
      note: tx.note,
    }));
  }, [transactions, categoryNameMap, accountNameMap]);

  const totalSpent = useMemo(
    () => transactions.reduce((sum, tx) => sum + tx.myAmount, 0),
    [transactions],
  );

  const detailSheetRef = useRef<FormSheetRef>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);

  const handleTransactionPress = useCallback((tx: TransactionItem) => {
    setSelectedTransaction(tx);
    detailSheetRef.current?.open();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            testID="transactions-back"
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={colors.foreground} />
          </Pressable>
          <Text
            style={[
              typography.sectionHeader,
              { color: colors.foreground, flex: 1 },
            ]}
          >
            {t('transactions.historyTitle')}
          </Text>
        </View>
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
              {t('transactions.totalLabel')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.destructive }]}>
              {fmt(totalSpent)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {t('transactions.countLabel')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.foreground }]}>
              {allTransactions.length}
            </Text>
          </View>
        </View>

        {allTransactions.map((tx) => {
          const isExpense = tx.amount < 0;
          return (
            <Pressable
              key={tx.id}
              onPress={() => handleTransactionPress(tx)}
              style={[
                styles.txRow,
                {
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
              testID={`tx-${tx.id}`}
            >
              <View style={styles.txLeft}>
                <Text style={[styles.txDescription, { color: colors.cardForeground }]}>
                  {tx.description}
                </Text>
                <Text style={[styles.txMeta, { color: colors.mutedForeground }]}>
                  {tx.category} · {formatShortDate(new Date(tx.date))}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: isExpense ? colors.destructive : colors.positive },
                ]}
              >
                {fmt(tx.amount)}
              </Text>
            </Pressable>
          );
        })}

        {allTransactions.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t('transactions.emptyHistory')}
            </Text>
          </View>
        )}
      </ScrollView>

      <TransactionDetailSheet
        ref={detailSheetRef}
        transaction={selectedTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
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
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txLeft: {
    flex: 1,
    marginRight: 12,
  },
  txDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  txMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  txAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
});
