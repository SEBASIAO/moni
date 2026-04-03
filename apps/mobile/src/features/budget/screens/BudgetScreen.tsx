import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { BudgetCategoryCard } from '../components/BudgetCategoryCard';
import { CategoryFormSheet } from '../components/CategoryFormSheet';
import { ProgressBar } from '../components/ProgressBar';
import { useBudgetData } from '../hooks/useBudgetData';

export function BudgetScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing, radii } = theme.moni;
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { categories, totalBudgeted, totalSpent, month } = useBudgetData();

  const sheetRef = useRef<FormSheetRef>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    budget: number;
  } | null>(null);

  const overallProgress = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;

  const handleFabPress = useCallback(() => {
    setEditingCategory(null);
    sheetRef.current?.open();
  }, []);

  const handleCategoryPress = useCallback(
    (category: { id: string; name: string; budget: number }) => {
      setEditingCategory(category);
      sheetRef.current?.open();
    },
    [],
  );

  const handleSaved = useCallback(() => {
    setEditingCategory(null);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
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
          <Pressable
            key={category.id}
            onPress={() =>
              handleCategoryPress({
                id: category.id,
                name: category.name,
                budget: category.budget,
              })
            }
            testID={`budget-category-${category.id}`}
          >
            <BudgetCategoryCard category={category} />
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={handleFabPress}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        testID="budget-add-category-fab"
      >
        <Plus size={24} color={colors.onPrimary} />
      </Pressable>

      <CategoryFormSheet
        ref={sheetRef}
        category={editingCategory}
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
