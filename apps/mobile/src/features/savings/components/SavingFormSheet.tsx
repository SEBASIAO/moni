import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { useSavingsCRUD } from '../hooks/useSavingsCRUD';

interface SavingFormSheetProps {
  saving: { id: string; name: string; targetAmount: number | null } | null;
  onSaved?: () => void;
}

export const SavingFormSheet = forwardRef<FormSheetRef, SavingFormSheetProps>(
  function SavingFormSheet({ saving, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const { createSaving, updateSaving, deleteSaving, isSaving } = useSavingsCRUD();

    const formSheetRef = useRef<FormSheetRef>(null);

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState(0);

    const isEditing = saving != null;
    const canSubmit = name.trim().length > 0;

    useEffect(() => {
      if (saving != null) {
        setName(saving.name);
        setTargetAmount(saving.targetAmount ?? 0);
      } else {
        setName('');
        setTargetAmount(0);
      }
    }, [saving]);

    React.useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    const handleSubmit = useCallback(async () => {
      try {
        if (isEditing) {
          await updateSaving(saving.id, {
            name: name.trim(),
            targetAmount: targetAmount > 0 ? targetAmount : null,
          });
        } else {
          await createSaving({
            name: name.trim(),
            targetAmount: targetAmount > 0 ? targetAmount : null,
          });
        }
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error is stored in hook state
      }
    }, [isEditing, saving, name, targetAmount, createSaving, updateSaving, onSaved]);

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
                await deleteSaving(saving.id);
                formSheetRef.current?.close();
                onSaved?.();
              } catch {
                // error is stored in hook state
              }
            },
          },
        ],
      );
    }, [isEditing, saving, deleteSaving, onSaved, t]);

    const handleClose = useCallback(() => {
      setName('');
      setTargetAmount(0);
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
        title={isEditing ? t('savingsForm.editSaving') : t('savingsForm.addSaving')}
        actionLabel={t('common.save')}
        canSubmit={canSubmit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        destructiveLabel={isEditing ? t('savingsForm.delete') : undefined}
        onDestructive={isEditing ? handleDelete : undefined}
        onClose={handleClose}
      >
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('savingsForm.savingName')}
          </Text>
          <BottomSheetTextInput
            value={name}
            onChangeText={setName}
            style={inputStyle}
            placeholder={t('savingsForm.savingName')}
            placeholderTextColor={colors.mutedForeground}
            testID="saving-form-name"
          />
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('savingsForm.targetAmount')}
          </Text>
          <CurrencyInput
            value={targetAmount}
            onChangeValue={setTargetAmount}
            style={inputStyle}
            testID="saving-form-target"
          />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {t('savings.noTarget')}
          </Text>
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
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
