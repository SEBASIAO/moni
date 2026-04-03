import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { useTheme } from '@/shared/hooks/useTheme';

import { useIncomeCRUD } from '../hooks/useIncomeCRUD';
import type { IncomeFrequency } from '@/database/models/Income';

interface IncomeFormSheetProps {
  income?: {
    id: string;
    name: string;
    expectedAmount: number;
    frequency: string;
  } | null;
  periodYear: number;
  periodMonth: number;
  onSaved?: (() => void) | undefined;
}

export const IncomeFormSheet = forwardRef<FormSheetRef, IncomeFormSheetProps>(
  function IncomeFormSheet({ income, periodYear, periodMonth, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const formSheetRef = useRef<FormSheetRef>(null);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState(0);
    const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');

    const { createIncome, updateIncome, deleteIncome, isSaving } = useIncomeCRUD();

    const isEditing = income != null;

    useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    useEffect(() => {
      if (income != null) {
        setName(income.name);
        setAmount(income.expectedAmount);
        setFrequency(income.frequency as IncomeFrequency);
      } else {
        setName('');
        setAmount(0);
        setFrequency('monthly');
      }
    }, [income]);

    const canSubmit = name.trim() !== '' && amount > 0;

    const handleSubmit = useCallback(async () => {
      if (!canSubmit) return;
      try {
        if (isEditing) {
          await updateIncome(income.id, {
            name: name.trim(),
            expectedAmount: amount,
            frequency,
          });
        } else {
          await createIncome({
            name: name.trim(),
            expectedAmount: amount,
            frequency,
            periodYear,
            periodMonth,
          });
        }
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error captured in hook
      }
    }, [
      canSubmit,
      isEditing,
      income,
      name,
      amount,
      frequency,
      periodYear,
      periodMonth,
      createIncome,
      updateIncome,
      onSaved,
    ]);

    const handleDelete = useCallback(() => {
      if (!isEditing) return;
      Alert.alert(t('forms.confirmDelete'), undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncome(income.id);
              formSheetRef.current?.close();
              onSaved?.();
            } catch {
              // error captured in hook
            }
          },
        },
      ]);
    }, [isEditing, income, deleteIncome, onSaved, t]);

    const handleClose = useCallback(() => {
      setName('');
      setAmount(0);
      setFrequency('monthly');
    }, []);

    const inputStyle = {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colors.foreground,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    };

    const frequencies: Array<{ key: IncomeFrequency; label: string }> = [
      { key: 'monthly', label: t('income.monthly') },
      { key: 'biweekly', label: t('income.biweekly') },
      { key: 'one_time', label: t('income.oneTime') },
    ];

    return (
      <FormSheet
        ref={formSheetRef}
        title={isEditing ? t('income.editIncome') : t('income.addIncome')}
        actionLabel={t('common.save')}
        canSubmit={canSubmit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        destructiveLabel={isEditing ? t('common.delete') : undefined}
        onDestructive={isEditing ? handleDelete : undefined}
        onClose={handleClose}
      >
        {/* Name */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('income.incomeName')}
          </Text>
          <BottomSheetTextInput
            value={name}
            onChangeText={setName}
            placeholder={t('income.incomeName')}
            placeholderTextColor={colors.mutedForeground}
            style={inputStyle}
            testID="income-form-name"
          />
        </View>

        {/* Amount */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('income.amount')}
          </Text>
          <CurrencyInput
            value={amount}
            onChangeValue={setAmount}
            style={inputStyle}
            placeholderTextColor={colors.mutedForeground}
            testID="income-form-amount"
          />
        </View>

        {/* Frequency */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('income.frequency')}
          </Text>
          <View style={styles.chipRow}>
            {frequencies.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFrequency(f.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      frequency === f.key ? colors.primary : 'transparent',
                    borderColor:
                      frequency === f.key ? colors.primary : colors.border,
                  },
                ]}
                testID={`income-freq-${f.key}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        frequency === f.key ? '#FFFFFF' : colors.foreground,
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </FormSheet>
    );
  },
);

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  chipRow: {
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
});
