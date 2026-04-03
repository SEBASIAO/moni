import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import type { Collection, Model } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import type { Transaction as TransactionModel } from '@/database/models/Transaction';
import type { FixedPayment } from '@/database/models/FixedPayment';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { formatShortDate } from '@/shared/utils/formatters';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';

interface TransactionData {
  id: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  date: number;
  note: string | null;
}

interface TransactionDetailSheetProps {
  transaction: TransactionData | null;
  onDeleted?: () => void;
}

export const TransactionDetailSheet = forwardRef<FormSheetRef, TransactionDetailSheetProps>(
  function TransactionDetailSheet({ transaction, onDeleted }, ref) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme().moni;
    const fmt = useFormatCurrency();
    const formSheetRef = useRef<FormSheetRef>(null);

    useImperativeHandle(ref, () => ({
      open: () => formSheetRef.current?.open(),
      close: () => formSheetRef.current?.close(),
    }));

    const handleDelete = useCallback(() => {
      if (transaction == null) return;

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
                await database.write(async () => {
                  const record = await database
                    .get<TransactionModel>('transactions')
                    .find(transaction.id);
                  await record.markAsDeleted();

                  // If linked to a fixed payment, undo it
                  if (transaction.note?.startsWith('fixed_payment:')) {
                    const fixedId = transaction.note.replace('fixed_payment:', '');
                    try {
                      const fp = await database
                        .get<FixedPayment>('fixed_payments')
                        .find(fixedId);
                      await fp.update((r) => {
                        r.isPaid = false;
                        r.actualAmount = null as unknown as number;
                      });
                    } catch {
                      // fixed payment may have been deleted
                    }
                  }
                });
                formSheetRef.current?.close();
                onDeleted?.();
              } catch {
                // error
              }
            },
          },
        ],
      );
    }, [transaction, onDeleted, t]);

    const parsedDate = transaction != null ? new Date(transaction.date) : new Date();
    const isExpense = transaction != null ? transaction.amount < 0 : false;

    return (
      <FormSheet
        ref={formSheetRef}
        title={transaction?.description ?? ''}
        destructiveLabel={transaction != null ? t('transactions.undoTransaction') : undefined}
        onDestructive={transaction != null ? handleDelete : undefined}
      >
        {transaction != null && (
          <>
            <View style={[styles.row, { marginBottom: spacing.sm }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {t('transactions.amountLabel')}
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: isExpense ? colors.destructive : colors.positive },
                ]}
              >
                {fmt(transaction.amount)}
              </Text>
            </View>

            {transaction.category !== '' && (
              <View style={[styles.row, { marginBottom: spacing.sm }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  {t('transactions.category')}
                </Text>
                <Text style={[styles.value, { color: colors.foreground }]}>
                  {transaction.category}
                </Text>
              </View>
            )}

            {transaction.account !== '' && (
              <View style={[styles.row, { marginBottom: spacing.sm }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  {t('transactions.account')}
                </Text>
                <Text style={[styles.value, { color: colors.foreground }]}>
                  {transaction.account}
                </Text>
              </View>
            )}

            <View style={[styles.row, { marginBottom: spacing.sm }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {t('transactions.dateLabel')}
              </Text>
              <Text style={[styles.value, { color: colors.foreground }]}>
                {formatShortDate(parsedDate)}
              </Text>
            </View>
          </>
        )}
      </FormSheet>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
