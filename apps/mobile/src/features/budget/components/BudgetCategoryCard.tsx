import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Tag } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

import type { BudgetCategoryData } from '../hooks/useBudgetData';
import { ProgressBar } from './ProgressBar';

interface BudgetCategoryCardProps {
  category: BudgetCategoryData;
}

export function BudgetCategoryCard({ category }: BudgetCategoryCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, typography, radii } = theme.moni;
  const fmt = useFormatCurrency();

  const progress = category.budget > 0 ? category.spent / category.budget : 0;
  const percentage = Math.round(progress * 100);
  const hasCreditCard = category.creditCardAmount > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.nameRow}>
          <Tag
            size={18}
            color={colors.mutedForeground}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={[typography.cardTitle, { color: colors.cardForeground }]}>
            {category.name}
          </Text>
        </View>
        <Text style={[styles.percentage, { color: colors.mutedForeground }]}>
          {percentage}%
        </Text>
      </View>

      <Text
        style={[
          styles.amounts,
          { color: colors.mutedForeground, marginTop: spacing.xs, marginBottom: spacing.sm },
        ]}
      >
        <Text style={[styles.spentAmount, { color: colors.cardForeground }]}>
          {fmt(category.spent)}
        </Text>
        {` ${t('budget.of')} `}
        {fmt(category.budget)}
      </Text>

      <ProgressBar progress={progress} height={6} />

      {hasCreditCard && (
        <Text
          style={[
            styles.creditCardNote,
            { color: colors.mutedForeground, marginTop: spacing.xs },
          ]}
        >
          {t('budget.includesInCC', { amount: fmt(category.creditCardAmount) })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  amounts: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  creditCardNote: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
