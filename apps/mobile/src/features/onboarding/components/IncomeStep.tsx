import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';

import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { useTheme } from '@/shared/hooks/useTheme';

import { StepLayout } from './StepLayout';

import type { IncomeFrequency } from '@/database/models';

export interface IncomeEntry {
  name: string;
  amount: number;
  frequency: IncomeFrequency;
}

interface IncomeStepProps {
  incomes: IncomeEntry[];
  onChangeIncomes: (incomes: IncomeEntry[]) => void;
  onNext: () => void;
  onBack?: () => void;
}

export function IncomeStep({ incomes, onChangeIncomes, onNext, onBack }: IncomeStepProps) {
  const { t } = useTranslation();
  const { colors, radii, spacing } = useTheme().moni;

  const frequencies: { label: string; value: IncomeFrequency }[] = [
    { label: t('onboarding.income.monthly'), value: 'monthly' },
    { label: t('onboarding.income.biweekly'), value: 'biweekly' },
  ];

  const updateIncome = (index: number, field: keyof IncomeEntry, value: string) => {
    const updated = incomes.map((income, i) =>
      i === index ? { ...income, [field]: value } : income,
    );
    onChangeIncomes(updated);
  };

  const updateFrequency = (index: number, frequency: IncomeFrequency) => {
    const updated = incomes.map((income, i) =>
      i === index ? { ...income, frequency } : income,
    );
    onChangeIncomes(updated);
  };

  const addIncome = () => {
    onChangeIncomes([...incomes, { name: '', amount: 0, frequency: 'monthly' }]);
  };

  const removeIncome = (index: number) => {
    if (incomes.length <= 1) return;
    onChangeIncomes(incomes.filter((_, i) => i !== index));
  };

  return (
    <StepLayout
      step={2}
      onBack={onBack}
      title={t('onboarding.income.title')}
      subtitle={t('onboarding.income.subtitle')}
      onNext={onNext}
    >
      {incomes.map((income, index) => (
        <View
          key={index}
          style={[styles.incomeCard, { borderColor: colors.border, borderRadius: radii.md }]}
        >
          {incomes.length > 1 && (
            <Pressable
              onPress={() => removeIncome(index)}
              style={styles.removeButton}
              testID={`remove-income-${index}`}
            >
              <Text style={[styles.removeText, { color: colors.destructive }]}>✕</Text>
            </Pressable>
          )}

          <TextInput
            style={[styles.nameInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            value={income.name}
            onChangeText={(text) => updateIncome(index, 'name', text)}
            placeholder={t('onboarding.income.incomeName')}
            placeholderTextColor={colors.mutedForeground}
            testID={`income-name-${index}`}
          />

          <CurrencyInput
            value={income.amount}
            onChangeValue={(v) => {
              const updated = incomes.map((inc, i) =>
                i === index ? { ...inc, amount: v } : inc,
              );
              onChangeIncomes(updated);
            }}
            style={[styles.amountInput, { color: colors.foreground }]}
            placeholderTextColor={colors.mutedForeground}
            testID={`income-amount-${index}`}
          />

          <View style={styles.frequencyRow}>
            {frequencies.map((freq) => (
              <Pressable
                key={freq.value}
                onPress={() => updateFrequency(index, freq.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      income.frequency === freq.value ? colors.primary : 'transparent',
                    borderColor:
                      income.frequency === freq.value ? colors.primary : colors.border,
                  },
                ]}
                testID={`income-freq-${freq.value}-${index}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        income.frequency === freq.value ? '#FFFFFF' : colors.foreground,
                    },
                  ]}
                >
                  {freq.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable onPress={addIncome} style={[styles.addButton, { marginTop: spacing.md }]} testID="add-income">
        <Text style={[styles.addText, { color: colors.secondary }]}>
          {t('onboarding.income.addAnother')}
        </Text>
      </Pressable>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  incomeCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  removeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nameInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    paddingVertical: 8,
    marginBottom: 12,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
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
