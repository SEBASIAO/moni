import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';

import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { useTheme } from '@/shared/hooks/useTheme';

import { StepLayout } from './StepLayout';

export interface FixedPaymentEntry {
  name: string;
  amount: number;
  day: string;
}

interface FixedPaymentsStepProps {
  payments: FixedPaymentEntry[];
  onChangePayments: (payments: FixedPaymentEntry[]) => void;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: (() => void) | undefined;
  nextLabel?: string | undefined;
}

const SUGGESTION_KEYS = ['rent', 'utilities', 'insurance', 'loans'] as const;

export function FixedPaymentsStep({
  payments,
  onChangePayments,
  onNext,
  onBack,
  onSkip,
  nextLabel,
}: FixedPaymentsStepProps) {
  const { t } = useTranslation();
  const { colors, radii, spacing } = useTheme().moni;

  const suggestions = SUGGESTION_KEYS.map((key) => ({
    key,
    label: t(`onboarding.fixedPayments.suggestions.${key}`),
  }));

  const addPayment = (prefillName?: string) => {
    onChangePayments([
      ...payments,
      { name: prefillName ?? '', amount: 0, day: '' },
    ]);
  };

  const updateField = (index: number, field: 'name' | 'day', value: string) => {
    const updated = payments.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    onChangePayments(updated);
  };

  const updateAmount = (index: number, value: number) => {
    const updated = payments.map((p, i) =>
      i === index ? { ...p, amount: value } : p,
    );
    onChangePayments(updated);
  };

  const removePayment = (index: number) => {
    onChangePayments(payments.filter((_, i) => i !== index));
  };

  return (
    <StepLayout
      step={5}
      onBack={onBack}
      title={t('onboarding.fixedPayments.title')}
      subtitle={t('onboarding.fixedPayments.subtitle')}
      onNext={onNext}
      onSkip={onSkip}
      nextLabel={nextLabel}
    >
      <View style={styles.suggestionsRow}>
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.key}
            onPress={() => addPayment(suggestion.label)}
            style={[styles.chip, { borderColor: colors.border }]}
            testID={`suggest-${suggestion.key}`}
          >
            <Text style={[styles.chipText, { color: colors.foreground }]}>{suggestion.label}</Text>
          </Pressable>
        ))}
      </View>

      {payments.map((payment, index) => (
        <View
          key={index}
          style={[styles.paymentCard, { borderColor: colors.border, borderRadius: radii.md }]}
        >
          <Pressable
            onPress={() => removePayment(index)}
            style={styles.removeButton}
            testID={`remove-payment-${index}`}
          >
            <Text style={[styles.removeText, { color: colors.destructive }]}>✕</Text>
          </Pressable>

          <TextInput
            style={[styles.nameInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            value={payment.name}
            onChangeText={(text) => updateField(index, 'name', text)}
            placeholder={t('onboarding.fixedPayments.paymentName')}
            placeholderTextColor={colors.mutedForeground}
            testID={`payment-name-${index}`}
          />

          <View style={styles.inlineRow}>
            <CurrencyInput
              value={payment.amount}
              onChangeValue={(v) => updateAmount(index, v)}
              style={[styles.amountInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              placeholderTextColor={colors.mutedForeground}
              testID={`payment-amount-${index}`}
            />
            <View style={styles.dayField}>
              <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{t('onboarding.fixedPayments.day')}</Text>
              <TextInput
                style={[styles.dayInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                value={payment.day}
                onChangeText={(text) =>
                  updateField(index, 'day', text.replace(/[^0-9]/g, '').slice(0, 2))
                }
                placeholder="1-31"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                testID={`payment-day-${index}`}
              />
            </View>
          </View>
        </View>
      ))}

      <Pressable
        onPress={() => addPayment()}
        style={[styles.addButton, { marginTop: spacing.md }]}
        testID="add-payment"
      >
        <Text style={[styles.addText, { color: colors.primary }]}>
          {t('onboarding.fixedPayments.addPayment')}
        </Text>
      </Pressable>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  paymentCard: {
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
    paddingRight: 24,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  dayField: {
    width: 80,
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
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
