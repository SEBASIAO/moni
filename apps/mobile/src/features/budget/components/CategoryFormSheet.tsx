import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { useCategoryCRUD } from '../hooks/useCategoryCRUD';

interface CategoryFormSheetProps {
  category?: { id: string; name: string; budget: number } | null;
  onSaved?: () => void;
}

export const CategoryFormSheet = forwardRef<FormSheetRef, CategoryFormSheetProps>(
  function CategoryFormSheet({ category, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const { createCategory, updateCategory, deleteCategory, isSaving } = useCategoryCRUD();

    const formSheetRef = useRef<FormSheetRef>(null);

    const [name, setName] = useState('');
    const [monthlyBudget, setMonthlyBudget] = useState(0);

    const isEditing = category != null;
    const canSubmit = name.trim() !== '';

    // Reset form when category prop changes
    useEffect(() => {
      if (category != null) {
        setName(category.name);
        setMonthlyBudget(category.budget);
      } else {
        setName('');
        setMonthlyBudget(0);
      }
    }, [category]);

    // Forward ref to inner FormSheet
    React.useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    const handleSubmit = useCallback(async () => {
      try {
        if (isEditing) {
          await updateCategory(category.id, { name: name.trim(), monthlyBudget });
        } else {
          await createCategory({ name: name.trim(), monthlyBudget });
        }
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error is stored in hook state
      }
    }, [isEditing, category, name, monthlyBudget, createCategory, updateCategory, onSaved]);

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
                await deleteCategory(category.id);
                formSheetRef.current?.close();
                onSaved?.();
              } catch {
                // error is stored in hook state
              }
            },
          },
        ],
      );
    }, [isEditing, category, deleteCategory, onSaved, t]);

    const handleClose = useCallback(() => {
      setName('');
      setMonthlyBudget(0);
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
        title={isEditing ? t('categories.editCategory') : t('categories.addCategory')}
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
            {t('categories.categoryName')}
          </Text>
          <BottomSheetTextInput
            value={name}
            onChangeText={setName}
            style={inputStyle}
            placeholder={t('categories.categoryName')}
            placeholderTextColor={colors.mutedForeground}
            testID="category-name-input"
          />
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {t('categories.monthlyBudget')}
          </Text>
          <CurrencyInput
            value={monthlyBudget}
            onChangeValue={setMonthlyBudget}
            style={inputStyle}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            testID="category-budget-input"
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
