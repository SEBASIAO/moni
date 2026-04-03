import React, { forwardRef, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAccountCRUD } from '@/features/credit-cards/hooks/useAccountCRUD';

interface AccountFormSheetProps {
  account?: { id: string; name: string; type: 'cash' | 'bank' } | null;
  onSaved?: () => void;
}

export const AccountFormSheet = forwardRef<FormSheetRef, AccountFormSheetProps>(
  function AccountFormSheet({ account, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const { createAccount, updateAccount, deleteAccount, isSaving } = useAccountCRUD();

    const [name, setName] = useState('');
    const [accountType, setAccountType] = useState<'cash' | 'bank'>('cash');

    const isEditing = account != null;
    const canSubmit = name.trim() !== '';

    useEffect(() => {
      if (account) {
        setName(account.name);
        setAccountType(account.type);
      } else {
        setName('');
        setAccountType('cash');
      }
    }, [account]);

    const handleSubmit = async () => {
      if (!canSubmit) return;

      try {
        if (isEditing) {
          await updateAccount(account.id, {
            name: name.trim(),
            cutOffDay: null,
            paymentDay: null,
          });
        } else {
          await createAccount({
            name: name.trim(),
            type: accountType,
            cutOffDay: null,
            paymentDay: null,
          });
        }
        onSaved?.();
      } catch {
        // Error is already captured in the hook
      }
    };

    const handleDelete = () => {
      if (!isEditing) return;

      Alert.alert(
        t('common.delete'),
        t('forms.confirmDelete'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount(account.id);
                onSaved?.();
              } catch {
                // Error is already captured in the hook
              }
            },
          },
        ],
      );
    };

    const handleClose = () => {
      setName('');
      setAccountType('cash');
    };

    return (
      <FormSheet
        ref={ref}
        title={isEditing ? t('accounts.editAccount') : t('accounts.addAccount')}
        actionLabel={t('common.save')}
        canSubmit={canSubmit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        destructiveLabel={isEditing ? t('common.delete') : undefined}
        onDestructive={isEditing ? handleDelete : undefined}
        onClose={handleClose}
      >
        {/* Account Name */}
        <Text style={[styles.label, { color: colors.foreground, marginBottom: spacing.xs }]}>
          {t('accounts.accountName')}
        </Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder={t('accounts.accountName')}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.textInput,
            {
              borderColor: colors.border,
              backgroundColor: colors.muted,
              color: colors.foreground,
            },
          ]}
          testID="account-name-input"
        />

        {/* Account Type */}
        <Text
          style={[
            styles.label,
            { color: colors.foreground, marginTop: spacing.md, marginBottom: spacing.xs },
          ]}
        >
          {t('accounts.accountType')}
        </Text>
        <View style={styles.typeChips}>
          <Pressable
            onPress={() => setAccountType('cash')}
            style={[
              styles.chip,
              {
                backgroundColor: accountType === 'cash' ? colors.primary : 'transparent',
                borderColor: accountType === 'cash' ? colors.primary : colors.border,
              },
            ]}
            testID="account-type-cash"
          >
            <Text
              style={[
                styles.chipText,
                { color: accountType === 'cash' ? '#FFFFFF' : colors.foreground },
              ]}
            >
              {t('accounts.cash')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAccountType('bank')}
            style={[
              styles.chip,
              {
                backgroundColor: accountType === 'bank' ? colors.primary : 'transparent',
                borderColor: accountType === 'bank' ? colors.primary : colors.border,
              },
            ]}
            testID="account-type-bank"
          >
            <Text
              style={[
                styles.chipText,
                { color: accountType === 'bank' ? '#FFFFFF' : colors.foreground },
              ]}
            >
              {t('accounts.bank')}
            </Text>
          </Pressable>
        </View>
      </FormSheet>
    );
  },
);

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  typeChips: {
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
