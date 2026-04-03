import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft, Plus } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { FixedPaymentItem } from '../components/FixedPaymentItem';
import { PaymentFormSheet } from '../components/PaymentFormSheet';
import { PayFixedPaymentSheet } from '../components/PayFixedPaymentSheet';
import { useFixedPaymentsData } from '../hooks/useFixedPaymentsData';

export function FixedPaymentsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing } = theme.moni;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { payments, totalPaid, totalPending, month, year } = useFixedPaymentsData();

  const editSheetRef = useRef<FormSheetRef>(null);
  const paySheetRef = useRef<FormSheetRef>(null);

  const [editingPayment, setEditingPayment] = useState<{
    id: string;
    name: string;
    amount: number;
    paymentDay: number;
  } | null>(null);

  const [payingPayment, setPayingPayment] = useState<{
    id: string;
    name: string;
    amount: number;
    isPaid: boolean;
  } | null>(null);

  const handleFabPress = useCallback(() => {
    setEditingPayment(null);
    editSheetRef.current?.open();
  }, []);

  const handlePaymentTap = useCallback(
    (payment: { id: string; name: string; amount: number; isPaid: boolean }) => {
      setPayingPayment(payment);
      paySheetRef.current?.open();
    },
    [],
  );

  const handlePaymentLongPress = useCallback(
    (payment: { id: string; name: string; amount: number; paymentDay: number }) => {
      setEditingPayment(payment);
      editSheetRef.current?.open();
    },
    [],
  );

  const handleSaved = useCallback(() => {
    setEditingPayment(null);
    setPayingPayment(null);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            testID="fixed-payments-back"
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={colors.foreground} />
          </Pressable>
          <Text
            style={[
              typography.sectionHeader,
              { color: colors.foreground, flex: 1 },
            ]}
          >
            {t('fixedPayments.title')}
          </Text>
        </View>
        <Text
          style={[
            styles.monthLabel,
            { color: colors.mutedForeground, marginBottom: spacing.lg },
          ]}
        >
          {t(`months.${month}`)}
        </Text>

        <View style={[styles.summaryRow, { marginBottom: spacing.lg }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {t('fixedPayments.paid')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.positive }]}>
              {fmt(totalPaid)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {t('fixedPayments.pending')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.mutedForeground }]}>
              {fmt(totalPending)}
            </Text>
          </View>
        </View>

        {payments.map((payment) => (
          <FixedPaymentItem
            key={payment.id}
            payment={payment}
            month={month}
            year={year}
            onPress={() =>
              handlePaymentTap({
                id: payment.id,
                name: payment.name,
                amount: payment.amount,
                isPaid: payment.isPaid,
              })
            }
            onLongPress={() =>
              handlePaymentLongPress({
                id: payment.id,
                name: payment.name,
                amount: payment.amount,
                paymentDay: payment.paymentDay,
              })
            }
          />
        ))}
      </ScrollView>

      <Pressable
        onPress={handleFabPress}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        testID="fixed-payments-add-fab"
      >
        <Plus size={24} color={colors.onPrimary} />
      </Pressable>

      <PaymentFormSheet
        ref={editSheetRef}
        payment={editingPayment}
        periodYear={year}
        periodMonth={month}
        onSaved={handleSaved}
      />

      <PayFixedPaymentSheet
        ref={paySheetRef}
        payment={payingPayment}
        onSaved={handleSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
