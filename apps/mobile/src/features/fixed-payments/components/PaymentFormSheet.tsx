import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { useFixedPaymentCRUD } from '../hooks/useFixedPaymentCRUD';

interface PaymentFormSheetProps {
  payment?: { id: string; name: string; amount: number; paymentDay: number } | null;
  periodYear: number;
  periodMonth: number;
  onSaved?: () => void;
}

export const PaymentFormSheet = forwardRef<FormSheetRef, PaymentFormSheetProps>(
  function PaymentFormSheet({ payment, periodYear, periodMonth, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const { createPayment, updatePayment, deletePayment, isSaving } = useFixedPaymentCRUD();

    const formSheetRef = useRef<FormSheetRef>(null);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState(0);
    const [paymentDay, setPaymentDay] = useState('');

    const isEditing = payment != null;
    const parsedDay = parseInt(paymentDay, 10);
    const canSubmit =
      name.trim() !== '' &&
      amount > 0 &&
      !isNaN(parsedDay) &&
      parsedDay >= 1 &&
      parsedDay <= 31;

    // Reset form when payment prop changes
    useEffect(() => {
      if (payment != null) {
        setName(payment.name);
        setAmount(payment.amount);
        setPaymentDay(String(payment.paymentDay));
      } else {
        setName('');
        setAmount(0);
        setPaymentDay('');
      }
    }, [payment]);

    // Forward ref to inner FormSheet
    React.useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    const handleSubmit = useCallback(async () => {
      const day = parseInt(paymentDay, 10);

      try {
        if (isEditing) {
          await updatePayment(payment.id, {
            name: name.trim(),
            amount,
            paymentDay: day,
          });
        } else {
          await createPayment({
            name: name.trim(),
            amount,
            paymentDay: day,
            periodYear,
            periodMonth,
          });
        }
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error is stored in hook state
      }
    }, [
      isEditing,
      payment,
      name,
      amount,
      paymentDay,
      periodYear,
      periodMonth,
      createPayment,
      updatePayment,
      onSaved,
    ]);

    const handleDelete = useCallback(() => {
      if (!isEditing) return;

      Alert.alert(
        t('forms.confirmDelete'),
        '',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePayment(payment.id);
                formSheetRef.current?.close();
                onSaved?.();
              } catch {
                // error is stored in hook state
              }
            },
          },
        ],
      );
    }, [isEditing, payment, deletePayment, onSaved, t]);

    const handleClose = useCallback(() => {
      setName('');
      setAmount(0);
      setPaymentDay('');
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

    return (
      <FormSheet
        ref={formSheetRef}
        title={isEditing ? t('fixedPaymentsForm.editPayment') : t('fixedPaymentsForm.addPayment')}
        actionLabel={t('common.save')}
        canSubmit={canSubmit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        destructiveLabel={isEditing ? t('common.delete') : undefined}
        onDestructive={isEditing ? handleDelete : undefined}
        onClose={handleClose}
      >
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('fixedPaymentsForm.paymentName')}
          </Text>
          <BottomSheetTextInput
            value={name}
            onChangeText={setName}
            style={inputStyle}
            placeholder={t('fixedPaymentsForm.paymentName')}
            placeholderTextColor={colors.mutedForeground}
            testID="payment-name-input"
          />
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('fixedPaymentsForm.amount')}
          </Text>
          <CurrencyInput
            value={amount}
            onChangeValue={setAmount}
            style={inputStyle}
            testID="payment-amount-input"
          />
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('fixedPaymentsForm.dayOfMonth')}
          </Text>
          <BottomSheetTextInput
            value={paymentDay}
            onChangeText={setPaymentDay}
            style={inputStyle}
            placeholder="1"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={2}
            testID="payment-day-input"
          />
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
});
