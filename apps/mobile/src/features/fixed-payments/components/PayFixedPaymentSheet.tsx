import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { DropdownSelect } from '@/shared/components/DropdownSelect';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { useFixedPaymentCRUD } from '../hooks/useFixedPaymentCRUD';

interface PayFixedPaymentSheetProps {
  payment: { id: string; name: string; amount: number; isPaid: boolean } | null;
  accounts: readonly { id: string; label: string }[];
  onSaved?: () => void;
}

export const PayFixedPaymentSheet = forwardRef<FormSheetRef, PayFixedPaymentSheetProps>(
  function PayFixedPaymentSheet({ payment, accounts, onSaved }, ref) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme().moni;
    const fmt = useFormatCurrency();
    const { markPaid, undoPaid, isSaving } = useFixedPaymentCRUD();

    const formSheetRef = useRef<FormSheetRef>(null);
    const [actualAmount, setActualAmount] = useState(0);
    const [accountId, setAccountId] = useState<string | null>(null);

    useEffect(() => {
      if (payment != null) {
        setActualAmount(payment.amount);
      }
    }, [payment]);

    React.useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    const handlePay = useCallback(async () => {
      if (payment == null || actualAmount <= 0 || accountId == null) return;

      try {
        await markPaid(payment.id, actualAmount, undefined, accountId);
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error in hook state
      }
    }, [payment, actualAmount, accountId, markPaid, onSaved]);

    const handleUndo = useCallback(async () => {
      if (payment == null) return;

      try {
        await undoPaid(payment.id);
        formSheetRef.current?.close();
        onSaved?.();
      } catch {
        // error in hook state
      }
    }, [payment, undoPaid, onSaved]);

    const handleClose = useCallback(() => {
      setActualAmount(0);
      setAccountId(null);
    }, []);

    const isPaid = payment?.isPaid ?? false;

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

    return (
      <FormSheet
        ref={formSheetRef}
        title={payment?.name ?? ''}
        actionLabel={isPaid ? t('fixedPayments.paid') : t('fixedPayments.markPaid')}
        canSubmit={!isPaid && actualAmount > 0 && accountId != null}
        isSubmitting={isSaving}
        onSubmit={handlePay}
        destructiveLabel={isPaid ? t('fixedPayments.undoPayment') : undefined}
        onDestructive={isPaid ? handleUndo : undefined}
        onClose={handleClose}
      >
        <View style={[styles.expectedRow, { marginBottom: spacing.md }]}>
          <Text style={[styles.expectedLabel, { color: colors.mutedForeground }]}>
            {t('fixedPayments.expected')}
          </Text>
          <Text style={[styles.expectedAmount, { color: colors.foreground }]}>
            {fmt(payment?.amount ?? 0)}
          </Text>
        </View>

        {!isPaid && (
          <>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {t('fixedPayments.actualAmount')}
              </Text>
              <CurrencyInput
                value={actualAmount}
                onChangeValue={setActualAmount}
                style={inputStyle}
                testID="pay-amount-input"
              />
            </View>
            <View style={{ marginBottom: spacing.md }}>
              <DropdownSelect
                items={accounts}
                selectedId={accountId}
                onSelect={setAccountId}
                label={t('transactions.account')}
                placeholder={t('transactions.selectAccount')}
                testID="pay-account-select"
              />
            </View>
          </>
        )}
      </FormSheet>
    );
  },
);

const styles = StyleSheet.create({
  expectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expectedLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  expectedAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  paidBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paidText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
