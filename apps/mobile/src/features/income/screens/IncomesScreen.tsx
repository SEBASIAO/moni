import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft, Plus } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { IncomeFormSheet } from '../components/IncomeFormSheet';
import { useIncomesData } from '../hooks/useIncomesData';

interface EditingIncome {
  id: string;
  name: string;
  expectedAmount: number;
  frequency: string;
}

export function IncomesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing, radii } = theme.moni;
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const navigation = useNavigation();
  const { incomes, totalExpected, totalReceived, month, year } = useIncomesData();

  const sheetRef = useRef<FormSheetRef>(null);
  const [editingIncome, setEditingIncome] = useState<EditingIncome | null>(null);

  const handleFabPress = useCallback(() => {
    setEditingIncome(null);
    sheetRef.current?.open();
  }, []);

  const handleIncomePress = useCallback((income: EditingIncome) => {
    setEditingIncome(income);
    sheetRef.current?.open();
  }, []);

  const handleSaved = useCallback(() => {
    setEditingIncome(null);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
      >
        {/* Header with back button */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            testID="incomes-back"
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
            {t('income.title')}
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

        {/* Summary */}
        <View style={[styles.summaryRow, { marginBottom: spacing.lg }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {t('income.expected')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.positive }]}>
              {fmt(totalExpected)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {t('income.received')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.cardForeground }]}>
              {fmt(totalReceived)}
            </Text>
          </View>
        </View>

        {/* Income list */}
        {incomes.map((income) => (
          <Pressable
            key={income.id}
            onPress={() =>
              handleIncomePress({
                id: income.id,
                name: income.name,
                expectedAmount: income.expectedAmount,
                frequency: income.frequency,
              })
            }
            testID={`income-item-${income.id}`}
          >
            <View
              style={[
                styles.incomeCard,
                {
                  backgroundColor: colors.card,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.incomeInfo}>
                <Text style={[styles.incomeName, { color: colors.cardForeground }]}>
                  {income.name}
                </Text>
                <Text style={[styles.incomeFreq, { color: colors.mutedForeground }]}>
                  {income.frequency === 'monthly'
                    ? t('income.monthly')
                    : income.frequency === 'biweekly'
                      ? t('income.biweekly')
                      : t('income.oneTime')}
                </Text>
              </View>
              <Text
                style={[
                  styles.incomeAmount,
                  { color: colors.cardForeground },
                ]}
              >
                {fmt(income.actualAmount ?? income.expectedAmount)}
              </Text>
            </View>
          </Pressable>
        ))}

        {incomes.length === 0 && (
          <View style={[styles.emptyState, { marginTop: spacing.lg }]}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t('income.empty')}
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={handleFabPress}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        testID="incomes-add-fab"
      >
        <Plus size={24} color={colors.onPrimary} />
      </Pressable>

      <IncomeFormSheet
        ref={sheetRef}
        income={editingIncome}
        periodYear={year}
        periodMonth={month}
        onSaved={handleSaved}
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
  incomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeInfo: {
    flex: 1,
  },
  incomeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeFreq: {
    fontSize: 12,
    marginTop: 2,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
