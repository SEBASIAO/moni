import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { useTheme } from '@/shared/hooks/useTheme';

import { AmountInput } from './AmountInput';
import { ChipSelector } from './ChipSelector';
import { ExpandableSection } from './ExpandableSection';
import { useSaveTransaction } from '../hooks/useSaveTransaction';

// ── Types ────────────────────────────────────────────────────────────────

interface CategoryOption {
  id: string;
  label: string;
}

interface AccountOption {
  id: string;
  label: string;
}

interface RegisterExpenseSheetProps {
  /** Available spending categories. */
  categories: readonly CategoryOption[];
  /** Available payment accounts. */
  accounts: readonly AccountOption[];
  /** Current budget period year. */
  periodYear: number;
  /** Current budget period month (1-12). */
  periodMonth: number;
  /** Called after a successful save so the parent can react (e.g. close sheet). */
  onSaved?: () => void;
}

export interface RegisterExpenseSheetRef {
  open: () => void;
  close: () => void;
}

const INSTALLMENT_NUMBER_OPTIONS = ['2', '3', '6', '12', '24', '36', '48'] as const;

// ── Component ────────────────────────────────────────────────────────────

export const RegisterExpenseSheet = forwardRef<
  RegisterExpenseSheetRef,
  RegisterExpenseSheetProps
>(function RegisterExpenseSheet(
  { categories, accounts, periodYear, periodMonth, onSaved },
  ref,
) {
  const { t } = useTranslation();
  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%', '95%'], []);

  const installmentOptions: readonly { id: string; label: string }[] = useMemo(
    () => [
      { id: '1', label: t('transactions.cash') },
      ...INSTALLMENT_NUMBER_OPTIONS.map((n) => ({ id: n, label: n })),
    ],
    [t],
  );

  // ── Form state ───────────────────────────────────────────────────────
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [installments, setInstallments] = useState('1');

  const { save, isSaving } = useSaveTransaction();

  // ── Imperative handle ────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.snapToIndex(0),
    close: () => bottomSheetRef.current?.close(),
  }));

  // ── Reset form ───────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setAmount(0);
    setDescription('');
    setCategoryId(null);
    setAccountId(null);
    setInstallments('1');
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (amount <= 0 || categoryId == null || accountId == null) {
      return;
    }

    Keyboard.dismiss();

    const totalInstallments = parseInt(installments, 10);
    const now = Date.now();

    await save({
      totalAmount: amount,
      myAmount: amount,
      description: description.trim() || t('transactions.defaultExpense'),
      transactionDate: now,
      categoryId,
      accountId,
      totalInstallments,
      isSubscription: false,
      note: null,
      periodYear,
      periodMonth,
    });

    resetForm();
    bottomSheetRef.current?.close();
    onSaved?.();
  }, [
    amount,
    categoryId,
    accountId,
    installments,
    description,
    periodYear,
    periodMonth,
    save,
    resetForm,
    onSaved,
  ]);

  // ── Derived ──────────────────────────────────────────────────────────
  const canSave =
    amount > 0 && categoryId != null && accountId != null && !isSaving;

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: theme.moni.colors.card,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.moni.colors.mutedForeground,
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text
          style={[
            styles.title,
            { color: theme.moni.colors.foreground },
          ]}
        >
          {t('transactions.title')}
        </Text>

        {/* Amount */}
        <AmountInput
          value={amount}
          onChangeAmount={setAmount}
          testID="register-expense-amount"
        />

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <BottomSheetView>
            <View
              style={[
                styles.descriptionInput,
                {
                  borderColor: theme.moni.colors.border,
                  backgroundColor: theme.moni.colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.descriptionPlaceholder,
                  {
                    color: description
                      ? theme.moni.colors.foreground
                      : theme.moni.colors.mutedForeground,
                  },
                ]}
                onPress={() => {
                  // Placeholder for TextInput focus — description editing
                }}
                testID="register-expense-description"
              >
                {description || t('transactions.descriptionPlaceholder')}
              </Text>
            </View>
          </BottomSheetView>
        </View>

        {/* Category chips */}
        <ChipSelector
          items={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          label={t('transactions.category')}
          testID="register-expense-category"
        />

        {/* Account chips */}
        <View style={styles.section}>
          <ChipSelector
            items={accounts}
            selectedId={accountId}
            onSelect={setAccountId}
            label={t('transactions.account')}
            testID="register-expense-account"
          />
        </View>

        {/* Installments (expandable) */}
        <ExpandableSection
          title={t('transactions.installments')}
          estimatedHeight={60}
          testID="register-expense-installments"
        >
          <ChipSelector
            items={installmentOptions}
            selectedId={installments}
            onSelect={setInstallments}
            testID="register-expense-installments-chips"
          />
        </ExpandableSection>

        {/* Save button */}
        <View style={styles.buttonContainer}>
          <View
            style={[
              styles.saveButton,
              {
                backgroundColor: canSave
                  ? theme.moni.colors.primary
                  : theme.moni.colors.muted,
              },
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                {
                  color: canSave
                    ? theme.moni.colors.onPrimary
                    : theme.moni.colors.mutedForeground,
                },
              ]}
              onPress={canSave ? handleSave : undefined}
              testID="register-expense-save"
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
    gap: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 8,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  descriptionPlaceholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  section: {
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
});
