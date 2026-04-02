import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

import { BudgetCategoryCard } from '../components/BudgetCategoryCard';
import { ProgressBar } from '../components/ProgressBar';
import { useBudgetData } from '../hooks/useBudgetData';

export function BudgetScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing, radii } = theme.moni;
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { categories, totalBudgeted, totalSpent, month } = useBudgetData();

  const overallProgress = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;

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
        {t('budget.title')}
      </Text>
      <Text
        style={[
          styles.monthLabel,
          { color: colors.mutedForeground, marginBottom: spacing.lg },
        ]}
      >
        {t(`months.${month}`)}
      </Text>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.card,
            borderRadius: radii.lg,
            padding: spacing.md,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            {t('budget.budgeted')}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.cardForeground }]}>
            {fmt(totalBudgeted)}
          </Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            {t('budget.spent')}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.cardForeground }]}>
            {fmt(totalSpent)}
          </Text>
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar progress={overallProgress} height={8} />
        </View>
      </View>

      {categories.map((category) => (
        <BudgetCategoryCard key={category.id} category={category} />
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
  summaryCard: {},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
