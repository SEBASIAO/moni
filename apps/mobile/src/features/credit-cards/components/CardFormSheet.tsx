import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { useTheme } from '@/shared/hooks/useTheme';

import { useAccountCRUD } from '../hooks/useAccountCRUD';

interface CardFormSheetProps {
  /** If provided, we're in edit mode. */
  card?: { id: string; name: string; cutOffDay: number; paymentDay: number } | null;
  onSaved?: () => void;
}

export const CardFormSheet = forwardRef<FormSheetRef, CardFormSheetProps>(
  function CardFormSheet({ card, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const { createAccount, updateAccount, deleteAccount, isSaving } = useAccountCRUD();
    const innerRef = useRef<FormSheetRef>(null);

    const [name, setName] = useState('');
    const [cutOffDay, setCutOffDay] = useState('');
    const [paymentDay, setPaymentDay] = useState('');

    const isEditing = card != null;

    // Reset form state when card changes (open create vs edit)
    useEffect(() => {
      if (card) {
        setName(card.name);
        setCutOffDay(String(card.cutOffDay));
        setPaymentDay(String(card.paymentDay));
      } else {
        setName('');
        setCutOffDay('');
        setPaymentDay('');
      }
    }, [card]);

    // Forward ref to inner FormSheet
    React.useImperativeHandle(ref, () => ({
      open: () => innerRef.current?.open(),
      close: () => innerRef.current?.close(),
    }));

    const parsedCutOff = parseInt(cutOffDay, 10);
    const parsedPayment = parseInt(paymentDay, 10);

    const canSubmit =
      name.trim() !== '' &&
      !isNaN(parsedCutOff) &&
      parsedCutOff >= 1 &&
      parsedCutOff <= 31 &&
      !isNaN(parsedPayment) &&
      parsedPayment >= 1 &&
      parsedPayment <= 31;

    const handleSubmit = async () => {
      if (!canSubmit) return;

      try {
        if (isEditing) {
          await updateAccount(card.id, {
            name: name.trim(),
            cutOffDay: parsedCutOff,
            paymentDay: parsedPayment,
          });
        } else {
          await createAccount({
            name: name.trim(),
            type: 'credit_card',
            cutOffDay: parsedCutOff,
            paymentDay: parsedPayment,
          });
        }

        innerRef.current?.close();
        onSaved?.();
      } catch {
        // error is already captured in the hook state
      }
    };

    const handleDelete = () => {
      if (!card) return;

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
                await deleteAccount(card.id);
                innerRef.current?.close();
                onSaved?.();
              } catch {
                // error is already captured in the hook state
              }
            },
          },
        ],
      );
    };

    const handleClose = () => {
      setName('');
      setCutOffDay('');
      setPaymentDay('');
    };

    const labelStyle = {
      color: colors.mutedForeground,
      fontSize: 13,
      fontWeight: '500' as const,
      marginBottom: 6,
    };

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
        ref={innerRef}
        title={isEditing ? t('cards.editCard') : t('cards.addCard')}
        actionLabel={t('common.save')}
        canSubmit={canSubmit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        destructiveLabel={isEditing ? t('common.delete') : undefined}
        onDestructive={isEditing ? handleDelete : undefined}
        onClose={handleClose}
      >
        <View style={{ gap: spacing.md }}>
          {/* Card name */}
          <View>
            <Text style={labelStyle}>
              {t('cards.cardName')}
            </Text>
            <BottomSheetTextInput
              value={name}
              onChangeText={setName}
              placeholder={t('cards.cardName')}
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              testID="card-name-input"
            />
          </View>

          {/* Cut-off day */}
          <View>
            <Text style={labelStyle}>
              {t('cards.cutOffDay')}
            </Text>
            <BottomSheetTextInput
              value={cutOffDay}
              onChangeText={setCutOffDay}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="1-31"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              testID="cut-off-day-input"
            />
          </View>

          {/* Payment day */}
          <View>
            <Text style={labelStyle}>
              {t('cards.paymentDay')}
            </Text>
            <BottomSheetTextInput
              value={paymentDay}
              onChangeText={setPaymentDay}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="1-31"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              testID="payment-day-input"
            />
          </View>
        </View>
      </FormSheet>
    );
  },
);

