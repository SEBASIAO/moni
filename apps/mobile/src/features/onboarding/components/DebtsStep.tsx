import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { StepLayout } from './StepLayout';

import type { AccountEntry } from './AccountsStep';

export interface DebtEntry {
  description: string;
  amount: string;
  currentInstallment: string;
  totalInstallments: string;
  accountIndex: number | null;
}

interface DebtsStepProps {
  debts: DebtEntry[];
  onChangeDebts: (debts: DebtEntry[]) => void;
  creditAccounts: AccountEntry[];
  onNext: () => void;
  onBack?: () => void;
  onSkip?: (() => void) | undefined;
}

export function DebtsStep({
  debts,
  onChangeDebts,
  creditAccounts,
  onNext,
  onBack,
  onSkip,
}: DebtsStepProps) {
  const { t } = useTranslation();
  const { colors, radii, spacing } = useTheme().moni;

  const addDebt = () => {
    onChangeDebts([
      ...debts,
      {
        description: '',
        amount: '',
        currentInstallment: '',
        totalInstallments: '',
        accountIndex: creditAccounts.length > 0 ? 0 : null,
      },
    ]);
  };

  const updateDebt = (index: number, field: keyof DebtEntry, value: string | number | null) => {
    const updated = debts.map((d, i) =>
      i === index ? { ...d, [field]: value } : d,
    );
    onChangeDebts(updated);
  };

  const removeDebt = (index: number) => {
    onChangeDebts(debts.filter((_, i) => i !== index));
  };

  return (
    <StepLayout
      step={6}
      onBack={onBack}
      title={t('onboarding.debts.title')}
      subtitle={t('onboarding.debts.subtitle')}
      onNext={onNext}
      onSkip={onSkip}
      nextLabel={t('common.start')}
    >
      {debts.map((debt, index) => (
        <View
          key={index}
          style={[styles.debtCard, { borderColor: colors.border, borderRadius: radii.md }]}
        >
          <Pressable
            onPress={() => removeDebt(index)}
            style={styles.removeButton}
            testID={`remove-debt-${index}`}
          >
            <Text style={[styles.removeText, { color: colors.destructive }]}>✕</Text>
          </Pressable>

          <TextInput
            style={[styles.input, { color: colors.foreground, borderBottomColor: colors.border }]}
            value={debt.description}
            onChangeText={(text) => updateDebt(index, 'description', text)}
            placeholder={t('onboarding.debts.description')}
            placeholderTextColor={colors.mutedForeground}
            testID={`debt-description-${index}`}
          />

          <TextInput
            style={[styles.amountInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            value={debt.amount}
            onChangeText={(text) =>
              updateDebt(index, 'amount', text.replace(/[^0-9]/g, ''))
            }
            placeholder={t('onboarding.debts.installmentAmount')}
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            testID={`debt-amount-${index}`}
          />

          <View style={styles.installmentRow}>
            <View style={styles.installmentField}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                {t('onboarding.debts.currentInstallment')}
              </Text>
              <TextInput
                style={[styles.smallInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                value={debt.currentInstallment}
                onChangeText={(text) =>
                  updateDebt(index, 'currentInstallment', text.replace(/[^0-9]/g, ''))
                }
                placeholder="1"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                testID={`debt-current-${index}`}
              />
            </View>
            <Text style={[styles.separator, { color: colors.mutedForeground }]}>{t('onboarding.debts.of')}</Text>
            <View style={styles.installmentField}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                {t('onboarding.debts.totalInstallments')}
              </Text>
              <TextInput
                style={[styles.smallInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                value={debt.totalInstallments}
                onChangeText={(text) =>
                  updateDebt(index, 'totalInstallments', text.replace(/[^0-9]/g, ''))
                }
                placeholder="12"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                testID={`debt-total-${index}`}
              />
            </View>
          </View>

          {creditAccounts.length > 0 && (
            <View style={styles.accountSection}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>
                {t('onboarding.debts.creditCard')}
              </Text>
              <View style={styles.accountChips}>
                {creditAccounts.map((account, accIdx) => (
                  <Pressable
                    key={accIdx}
                    onPress={() => updateDebt(index, 'accountIndex', accIdx)}
                    style={[
                      styles.chip,
                      {
                        borderColor:
                          debt.accountIndex === accIdx ? colors.primary : colors.border,
                        backgroundColor:
                          debt.accountIndex === accIdx ? colors.primary : 'transparent',
                      },
                    ]}
                    testID={`debt-account-${index}-${accIdx}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            debt.accountIndex === accIdx ? '#FFFFFF' : colors.foreground,
                        },
                      ]}
                    >
                      {account.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}

      <Pressable
        onPress={addDebt}
        style={[styles.addButton, { marginTop: spacing.md }]}
        testID="add-debt"
      >
        <Text style={[styles.addText, { color: colors.secondary }]}>
          {t('onboarding.debts.addDebt')}
        </Text>
      </Pressable>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  debtCard: {
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
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
    paddingRight: 24,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
  },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  installmentField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  smallInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
    textAlign: 'center',
  },
  separator: {
    fontSize: 16,
    paddingBottom: 10,
  },
  accountSection: {
    marginTop: 4,
  },
  accountChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
