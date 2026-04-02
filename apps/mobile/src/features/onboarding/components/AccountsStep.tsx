import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { StepLayout } from './StepLayout';

import type { AccountType } from '@/database/models';

export interface AccountEntry {
  name: string;
  type: AccountType;
  cutOffDay: string;
  paymentDay: string;
}

interface AccountsStepProps {
  accounts: AccountEntry[];
  onChangeAccounts: (accounts: AccountEntry[]) => void;
  onNext: () => void;
  onBack?: () => void;
}

export function AccountsStep({ accounts, onChangeAccounts, onNext, onBack }: AccountsStepProps) {
  const { t } = useTranslation();
  const { colors, radii, spacing } = useTheme().moni;

  const quickAccounts: { label: string; name: string; type: AccountType }[] = [
    { label: t('onboarding.accounts.cash'), name: t('onboarding.accounts.cashType'), type: 'cash' },
    { label: t('onboarding.accounts.debit'), name: t('onboarding.accounts.debit').replace('+ ', ''), type: 'bank' },
  ];
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditName, setCreditName] = useState('');
  const [creditCutOff, setCreditCutOff] = useState('');
  const [creditPaymentDay, setCreditPaymentDay] = useState('');

  const hasAccount = (name: string) => accounts.some((a) => a.name === name);

  const addQuickAccount = (name: string, type: AccountType) => {
    if (type === 'cash' && hasAccount(name)) return;
    const count = accounts.filter((a) => a.type === type).length;
    const finalName = type === 'cash' ? name : (count === 0 ? name : `${name} ${count + 1}`);
    onChangeAccounts([...accounts, { name: finalName, type, cutOffDay: '', paymentDay: '' }]);
  };

  const canAddCard =
    creditName.trim().length > 0 &&
    creditCutOff.length > 0 &&
    parseInt(creditCutOff, 10) >= 1 &&
    parseInt(creditCutOff, 10) <= 31 &&
    creditPaymentDay.length > 0 &&
    parseInt(creditPaymentDay, 10) >= 1 &&
    parseInt(creditPaymentDay, 10) <= 31;

  const addCreditCard = () => {
    if (!canAddCard) return;
    onChangeAccounts([
      ...accounts,
      {
        name: creditName.trim(),
        type: 'credit_card',
        cutOffDay: creditCutOff,
        paymentDay: creditPaymentDay,
      },
    ]);
    setCreditName('');
    setCreditCutOff('');
    setCreditPaymentDay('');
    setShowCreditForm(false);
  };

  const removeAccount = (index: number) => {
    onChangeAccounts(accounts.filter((_, i) => i !== index));
  };

  return (
    <StepLayout
      step={3}
      onBack={onBack}
      title={t('onboarding.accounts.title')}
      subtitle={t('onboarding.accounts.subtitle')}
      onNext={onNext}
    >
      <View style={styles.quickRow}>
        {quickAccounts.map((qa) => (
          <Pressable
            key={qa.name}
            onPress={() => addQuickAccount(qa.name, qa.type)}
            style={[
              styles.chip,
              {
                borderColor: hasAccount(qa.name) ? colors.primary : colors.border,
                backgroundColor: hasAccount(qa.name) ? colors.primary : 'transparent',
              },
            ]}
            testID={`quick-account-${qa.name}`}
          >
            <Text
              style={[
                styles.chipText,
                { color: hasAccount(qa.name) ? '#FFFFFF' : colors.foreground },
              ]}
            >
              {qa.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => setShowCreditForm(!showCreditForm)}
        style={[styles.chip, { borderColor: colors.border, marginTop: spacing.sm }]}
        testID="add-credit-card-toggle"
      >
        <Text style={[styles.chipText, { color: colors.foreground }]}>
          {t('onboarding.accounts.creditCard')}
        </Text>
      </Pressable>

      {showCreditForm && (
        <View style={[styles.creditForm, { borderColor: colors.border, borderRadius: radii.md }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderBottomColor: colors.border }]}
            value={creditName}
            onChangeText={setCreditName}
            placeholder={t('onboarding.accounts.cardName')}
            placeholderTextColor={colors.mutedForeground}
            testID="credit-name"
          />
          <View style={styles.dayRow}>
            <View style={styles.dayField}>
              <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{t('onboarding.accounts.cutOffDay')}</Text>
              <TextInput
                style={[styles.dayInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                value={creditCutOff}
                onChangeText={(val) => setCreditCutOff(val.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="1-31"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                testID="credit-cutoff"
              />
            </View>
            <View style={styles.dayField}>
              <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{t('onboarding.accounts.paymentDay')}</Text>
              <TextInput
                style={[styles.dayInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                value={creditPaymentDay}
                onChangeText={(val) => setCreditPaymentDay(val.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="1-31"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                testID="credit-payment-day"
              />
            </View>
          </View>
          <Pressable
            onPress={addCreditCard}
            disabled={!canAddCard}
            style={[
              styles.addCardButton,
              {
                backgroundColor: canAddCard ? colors.primary : colors.muted,
                borderRadius: radii.md,
              },
            ]}
            testID="confirm-credit-card"
          >
            <Text style={[styles.addCardText, { opacity: canAddCard ? 1 : 0.5 }]}>
              {t('onboarding.accounts.addCard')}
            </Text>
          </Pressable>
        </View>
      )}

      {accounts.length > 0 && (
        <View style={[styles.accountsList, { marginTop: spacing.md }]}>
          {accounts.map((account, index) => (
            <View
              key={index}
              style={[styles.accountRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.accountInfo}>
                <TextInput
                  style={[styles.accountName, { color: colors.foreground }]}
                  value={account.name}
                  onChangeText={(text) => {
                    const updated = accounts.map((a, i) =>
                      i === index ? { ...a, name: text } : a,
                    );
                    onChangeAccounts(updated);
                  }}
                  placeholder={t('onboarding.accounts.accountName')}
                  placeholderTextColor={colors.mutedForeground}
                  testID={`account-name-${index}`}
                />
                <Text style={[styles.accountType, { color: colors.mutedForeground }]}>
                  {account.type === 'credit_card'
                    ? `${t('onboarding.accounts.creditCardType')} — ${t('onboarding.accounts.cutOff')}: ${account.cutOffDay}, ${t('onboarding.accounts.payment')}: ${account.paymentDay}`
                    : account.type === 'cash'
                      ? t('onboarding.accounts.cashType')
                      : t('onboarding.accounts.bankAccount')}
                </Text>
              </View>
              <Pressable
                onPress={() => removeAccount(index)}
                style={styles.removeButton}
                testID={`remove-account-${index}`}
              >
                <Text style={[styles.removeText, { color: colors.destructive }]}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  creditForm: {
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dayField: {
    flex: 1,
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
  addCardButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  addCardText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  accountsList: {
    gap: 0,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  accountType: {
    fontSize: 13,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  removeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
