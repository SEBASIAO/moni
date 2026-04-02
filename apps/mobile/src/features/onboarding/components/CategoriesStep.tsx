import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Trash2 } from 'lucide-react-native';

import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { useTheme } from '@/shared/hooks/useTheme';

import { StepLayout } from './StepLayout';

export interface CategoryEntry {
  name: string;
  budget: number;
  enabled: boolean;
}

interface CategoriesStepProps {
  categories: CategoryEntry[];
  onChangeCategories: (categories: CategoryEntry[]) => void;
  onNext: () => void;
  onBack?: (() => void) | undefined;
}

const DEFAULT_CATEGORY_KEYS = [
  { key: 'mercado', budget: 500000 },
  { key: 'salidas', budget: 300000 },
  { key: 'gasolina', budget: 200000 },
  { key: 'compras', budget: 0 },
  { key: 'hogar', budget: 0 },
  { key: 'mascota', budget: 0 },
  { key: 'salud', budget: 0 },
  { key: 'regalos', budget: 0 },
  { key: 'peluqueadas', budget: 100000 },
] as const;

export function getDefaultCategories(t: (key: string) => string): CategoryEntry[] {
  return DEFAULT_CATEGORY_KEYS.map(({ key, budget }) => ({
    name: t(`onboarding.categories.defaultNames.${key}`),
    budget,
    enabled: true,
  }));
}

export function CategoriesStep({
  categories,
  onChangeCategories,
  onNext,
  onBack,
}: CategoriesStepProps) {
  const { t } = useTranslation();
  const { colors, radii, spacing } = useTheme().moni;

  const removeCategory = (index: number) => {
    onChangeCategories(categories.filter((_, i) => i !== index));
  };

  const updateName = (index: number, name: string) => {
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, name } : cat,
    );
    onChangeCategories(updated);
  };

  const updateBudget = (index: number, budget: number) => {
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, budget } : cat,
    );
    onChangeCategories(updated);
  };

  const addCategory = () => {
    onChangeCategories([...categories, { name: '', budget: 0, enabled: true }]);
  };

  return (
    <StepLayout
      step={4}
      onBack={onBack}
      title={t('onboarding.categories.title')}
      subtitle={t('onboarding.categories.subtitle')}
      onNext={onNext}
    >
      {categories.map((category, index) => (
        <View
          key={index}
          style={[styles.row, { borderBottomColor: colors.border }]}
        >
          <Pressable
            onPress={() => removeCategory(index)}
            hitSlop={8}
            style={styles.deleteButton}
            testID={`category-delete-${index}`}
          >
            <Trash2 size={18} color={colors.mutedForeground} />
          </Pressable>
          <TextInput
            style={[styles.nameInput, { color: colors.foreground }]}
            value={category.name}
            onChangeText={(text) => updateName(index, text)}
            placeholder={t('onboarding.categories.categoryPlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            testID={`category-name-${index}`}
          />
          <CurrencyInput
            value={category.budget}
            onChangeValue={(v) => updateBudget(index, v)}
            style={[
              styles.budgetInput,
              {
                color: colors.foreground,
                backgroundColor: colors.muted,
                borderRadius: radii.md,
              },
            ]}
            placeholderTextColor={colors.mutedForeground}
            testID={`category-budget-${index}`}
          />
        </View>
      ))}

      <Pressable
        onPress={addCategory}
        style={[styles.addButton, { marginTop: spacing.sm }]}
        testID="add-category"
      >
        <Text style={[styles.addText, { color: colors.primary }]}>
          {t('onboarding.categories.addCategory')}
        </Text>
      </Pressable>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  budgetInput: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 110,
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
