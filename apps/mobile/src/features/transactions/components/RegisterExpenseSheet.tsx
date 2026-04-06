import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { FormSheet } from '@/shared/components/FormSheet';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { DropdownSelect } from '@/shared/components/DropdownSelect';
import { SegmentControl } from '@/shared/components/SegmentControl';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { DEFAULT_CATEGORY_ID } from '@/database/seed';

import { AmountInput } from './AmountInput';
import { useSaveTransaction } from '../hooks/useSaveTransaction';
import { useFixedPaymentCRUD } from '@/features/fixed-payments/hooks/useFixedPaymentCRUD';

// ── Types ────────────────────────────────────────────────────────────────

interface SelectOption {
  id: string;
  label: string;
  type?: string;
}

interface PendingFixedPayment {
  id: string;
  name: string;
  amount: number;
}

interface RegisterExpenseSheetProps {
  categories: readonly SelectOption[];
  accounts: readonly SelectOption[];
  pendingFixedPayments: readonly PendingFixedPayment[];
  periodYear: number;
  periodMonth: number;
  onSaved?: () => void;
}

export interface RegisterExpenseSheetRef {
  open: () => void;
  close: () => void;
}

type TabKey = 'expense' | 'fixed';

// ── Component ────────────────────────────────────────────────────────────

export const RegisterExpenseSheet = forwardRef<
  RegisterExpenseSheetRef,
  RegisterExpenseSheetProps
>(function RegisterExpenseSheet(
  { categories, accounts, pendingFixedPayments, periodYear, periodMonth, onSaved },
  ref,
) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, radii } = theme.moni;
  const fmt = useFormatCurrency();
  const formSheetRef = useRef<FormSheetRef>(null);

  const segments = useMemo(() => [
    { key: 'expense' as const, label: t('transactions.expense') },
    { key: 'fixed' as const, label: t('transactions.fixedPayment') },
  ], [t]);

  // ── Shared state ─────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabKey>('expense');
  const [paymentDate, setPaymentDate] = useState(() => new Date());

  // ── Expense state ────────────────────────────────────────────────────
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(DEFAULT_CATEGORY_ID);
  const [accountId, setAccountId] = useState<string | null>(null);

  // ── Fixed payment state ──────────────────────────────────────────────
  const [selectedFixedId, setSelectedFixedId] = useState<string | null>(null);
  const [actualAmount, setActualAmount] = useState(0);
  const [fixedAccountId, setFixedAccountId] = useState<string | null>(null);

  const { save, isSaving: isSavingExpense } = useSaveTransaction();
  const { markPaid, isSaving: isSavingFixed } = useFixedPaymentCRUD();

  const isSaving = isSavingExpense || isSavingFixed;

  const selectedFixed = useMemo(
    () => pendingFixedPayments.find((fp) => fp.id === selectedFixedId) ?? null,
    [pendingFixedPayments, selectedFixedId],
  );

  // When selecting a fixed payment, pre-fill amount
  const handleSelectFixed = useCallback((id: string) => {
    setSelectedFixedId(id);
    const fp = pendingFixedPayments.find((p) => p.id === id);
    if (fp) setActualAmount(fp.amount);
  }, [pendingFixedPayments]);

  const fixedPaymentOptions = useMemo(
    () => pendingFixedPayments.map((fp) => ({ id: fp.id, label: fp.name })),
    [pendingFixedPayments],
  );

  // ── Mutual exclusion: savings can't be both account and category ────
  const selectedAccountIsSavings = useMemo(
    () => accounts.find((a) => a.id === accountId)?.type === 'savings',
    [accounts, accountId],
  );
  const selectedCategoryIsSavings = useMemo(
    () => categories.find((c) => c.id === categoryId)?.type === 'savings',
    [categories, categoryId],
  );
  const filteredCategories = useMemo(
    () => selectedAccountIsSavings ? categories.filter((c) => c.type !== 'savings') : categories,
    [categories, selectedAccountIsSavings],
  );
  const filteredAccounts = useMemo(
    () => selectedCategoryIsSavings ? accounts.filter((a) => a.type !== 'savings') : accounts,
    [accounts, selectedCategoryIsSavings],
  );

  // ── Imperative handle ────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    open: () => formSheetRef.current?.open(),
    close: () => formSheetRef.current?.close(),
  }));

  // ── Reset ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setAmount(0);
    setDescription('');
    setCategoryId(DEFAULT_CATEGORY_ID);
    setAccountId(null);
    setPaymentDate(new Date());
    setSelectedFixedId(null);
    setActualAmount(0);
    setFixedAccountId(null);
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (tab === 'expense') {
      if (amount <= 0 || categoryId == null || accountId == null) return;

      await save({
        totalAmount: amount,
        myAmount: amount,
        description: description.trim() || t('transactions.defaultExpense'),
        transactionDate: paymentDate.getTime(),
        categoryId,
        accountId,
        totalInstallments: 1,
        isSubscription: false,
        note: null,
        periodYear,
        periodMonth,
      });
    } else {
      if (selectedFixedId == null || actualAmount <= 0 || fixedAccountId == null) return;
      await markPaid(selectedFixedId, actualAmount, paymentDate.getTime(), fixedAccountId);
    }

    resetForm();
    formSheetRef.current?.close();
    onSaved?.();
  }, [
    tab, amount, categoryId, accountId, description, paymentDate,
    periodYear, periodMonth, save,
    selectedFixedId, actualAmount, markPaid,
    resetForm, onSaved, t,
  ]);

  // ── Derived ──────────────────────────────────────────────────────────
  const canSave = tab === 'expense'
    ? amount > 0 && categoryId != null && accountId != null && !isSaving
    : selectedFixedId != null && actualAmount > 0 && fixedAccountId != null && !isSaving;

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

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <FormSheet
      ref={formSheetRef}
      title={t('transactions.registerPayment')}
      actionLabel={isSaving ? t('common.saving') : t('common.save')}
      canSubmit={canSave}
      isSubmitting={isSaving}
      onSubmit={handleSave}
      onClose={resetForm}
    >
      {/* Segment Control */}
      <View style={{ marginBottom: spacing.md }}>
        <SegmentControl
          segments={segments}
          selectedKey={tab}
          onSelect={(key) => setTab(key as TabKey)}
        />
      </View>

      {tab === 'expense' ? (
        <>
          <AmountInput
            value={amount}
            onChangeAmount={setAmount}
            autoFocus={false}
            testID="register-expense-amount"
          />

          <View style={styles.field}>
            <BottomSheetTextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('transactions.descriptionPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, inputStyle]}
              testID="register-expense-description"
            />
          </View>

          <View style={styles.field}>
            <DropdownSelect
              items={filteredCategories}
              selectedId={categoryId}
              onSelect={setCategoryId}
              label={t('transactions.category')}
              placeholder={t('transactions.selectCategory')}
              testID="register-expense-category"
            />
          </View>

          <View style={styles.field}>
            <DropdownSelect
              items={filteredAccounts}
              selectedId={accountId}
              onSelect={setAccountId}
              label={t('transactions.account')}
              placeholder={t('transactions.selectAccount')}
              testID="register-expense-account"
            />
          </View>

          <View style={styles.field}>
            <DatePickerField
              value={paymentDate}
              onChange={setPaymentDate}
              label={t('transactions.dateLabel')}
              testID="register-expense-date"
            />
          </View>
        </>
      ) : (
        <>
          {pendingFixedPayments.length === 0 ? (
            <View style={[styles.emptyState, { paddingVertical: spacing.xl }]}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t('transactions.noFixedPending')}
              </Text>
            </View>
          ) : (
            <>
              {/* Fixed payment list — collapses to selected item */}
              <View style={styles.field}>
                {pendingFixedPayments
                  .filter((fp) => selectedFixedId == null || fp.id === selectedFixedId)
                  .map((fp) => {
                    const isSelected = fp.id === selectedFixedId;
                    return (
                      <Pressable
                        key={fp.id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedFixedId(null);
                            setActualAmount(0);
                            setFixedAccountId(null);
                          } else {
                            handleSelectFixed(fp.id);
                          }
                        }}
                        style={[
                          styles.fixedItem,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary + '08' : colors.card,
                            borderRadius: radii.md,
                          },
                        ]}
                        testID={`fixed-option-${fp.id}`}
                      >
                        <Text
                          style={[
                            styles.fixedName,
                            { color: isSelected ? colors.primary : colors.foreground },
                          ]}
                        >
                          {fp.name}
                        </Text>
                        <Text
                          style={[
                            styles.fixedAmount,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {fmt(fp.amount)}
                        </Text>
                      </Pressable>
                    );
                  })}
              </View>

              {/* Actual amount + date */}
              {selectedFixed != null && (
                <>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>
                    {t('fixedPayments.actualAmount')}
                  </Text>
                  <CurrencyInput
                    value={actualAmount}
                    onChangeValue={setActualAmount}
                    style={inputStyle}
                    testID="fixed-actual-amount"
                  />
                </View>
                <View style={styles.field}>
                  <DropdownSelect
                    items={filteredAccounts}
                    selectedId={fixedAccountId}
                    onSelect={setFixedAccountId}
                    label={t('transactions.account')}
                    placeholder={t('transactions.selectAccount')}
                    testID="fixed-payment-account"
                  />
                </View>
                <View style={styles.field}>
                  <DatePickerField
                    value={paymentDate}
                    onChange={setPaymentDate}
                    label={t('transactions.dateLabel')}
                    testID="fixed-payment-date"
                  />
                </View>
                </>
              )}
            </>
          )}
        </>
      )}
    </FormSheet>
  );
});

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  textInput: {},
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  fixedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  fixedName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  fixedAmount: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
});
