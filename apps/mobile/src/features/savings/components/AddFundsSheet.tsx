import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { DropdownSelect } from '@/shared/components/DropdownSelect';
import { SegmentControl } from '@/shared/components/SegmentControl';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { useSavingsCRUD } from '../hooks/useSavingsCRUD';
import type { SavingData } from '../hooks/useSavingsData';

interface AddFundsSheetProps {
  saving: SavingData | null;
  accounts: { id: string; label: string }[];
  periodYear: number;
  periodMonth: number;
  onSaved?: () => void;
}

export const AddFundsSheet = forwardRef<FormSheetRef, AddFundsSheetProps>(
  function AddFundsSheet({ saving, accounts, periodYear, periodMonth, onSaved }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const fmt = useFormatCurrency();
    const { addFunds, updateBalance, isSaving } = useSavingsCRUD();

    const formSheetRef = useRef<FormSheetRef>(null);

    const [tab, setTab] = useState<string>('add');
    const [amount, setAmount] = useState(0);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [newBalance, setNewBalance] = useState(0);

    const segments = [
      { key: 'add', label: t('savings.addFunds') },
      { key: 'edit', label: t('savings.editBalance') },
    ];

    useEffect(() => {
      if (saving != null) {
        setNewBalance(saving.currentAmount);
      }
      setAmount(0);
      setAccountId(null);
      setTab('add');
    }, [saving]);

    React.useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    const canSubmit =
      tab === 'add' ? amount > 0 && accountId != null : true;

    const handleSubmit = useCallback(async () => {
      if (saving == null) return;

      try {
        if (tab === 'add') {
          await addFunds(saving.id, amount, accountId!, periodYear, periodMonth);
        } else {
          await updateBalance(saving.id, newBalance);
        }
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error is stored in hook state
      }
    }, [
      saving,
      tab,
      amount,
      accountId,
      newBalance,
      periodYear,
      periodMonth,
      addFunds,
      updateBalance,
      onSaved,
    ]);

    const handleClose = useCallback(() => {
      setAmount(0);
      setAccountId(null);
      setTab('add');
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
      fontFamily: 'Inter-Regular' as const,
    };

    const hasTarget = saving?.targetAmount != null && saving.targetAmount > 0;

    return (
      <FormSheet
        ref={formSheetRef}
        title={saving?.name ?? t('savings.addFunds')}
        actionLabel={t('common.save')}
        canSubmit={canSubmit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        onClose={handleClose}
      >
        <View style={[styles.balanceRow, { marginBottom: spacing.md }]}>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
            {t('savings.currentBalance')}
          </Text>
          <Text style={[styles.balanceAmount, { color: colors.foreground }]}>
            {fmt(saving?.currentAmount ?? 0)}
          </Text>
        </View>

        {hasTarget && (
          <View style={[styles.balanceRow, { marginBottom: spacing.md }]}>
            <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
              {t('savings.target')}
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.mutedForeground }]}>
              {fmt(saving!.targetAmount!)}
            </Text>
          </View>
        )}

        <View style={{ marginBottom: spacing.md }}>
          <SegmentControl
            segments={segments}
            selectedKey={tab}
            onSelect={setTab}
            testID="funds-segment"
          />
        </View>

        {tab === 'add' ? (
          <>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {t('savings.amount')}
              </Text>
              <CurrencyInput
                value={amount}
                onChangeValue={setAmount}
                style={inputStyle}
                testID="funds-amount-input"
              />
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <DropdownSelect
                items={accounts}
                selectedId={accountId}
                onSelect={setAccountId}
                label={t('savings.sourceAccount')}
                placeholder={t('savings.selectAccount')}
                testID="funds-account-select"
              />
            </View>
          </>
        ) : (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {t('savings.newBalance')}
            </Text>
            <CurrencyInput
              value={newBalance}
              onChangeValue={setNewBalance}
              style={inputStyle}
              testID="funds-balance-input"
            />
          </View>
        )}
      </FormSheet>
    );
  },
);

const styles = StyleSheet.create({
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
});
