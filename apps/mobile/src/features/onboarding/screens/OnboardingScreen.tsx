import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountsStep } from '@/features/onboarding/components/AccountsStep';
import { CategoriesStep, getDefaultCategories } from '@/features/onboarding/components/CategoriesStep';
import { CurrencyStep } from '@/features/onboarding/components/CurrencyStep';
import { FixedPaymentsStep } from '@/features/onboarding/components/FixedPaymentsStep';
import { IncomeStep } from '@/features/onboarding/components/IncomeStep';
import { useSaveOnboarding } from '@/features/onboarding/hooks/useSaveOnboarding';
import { DEFAULT_CURRENCY_CODE } from '@/shared/constants/currencies';
import { useCurrencyStore } from '@/shared/store/currencyStore';

import type { AccountEntry } from '@/features/onboarding/components/AccountsStep';
import type { CategoryEntry } from '@/features/onboarding/components/CategoriesStep';
import type { FixedPaymentEntry } from '@/features/onboarding/components/FixedPaymentsStep';
import type { IncomeEntry } from '@/features/onboarding/components/IncomeStep';

const TOTAL_STEPS = 5;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(DEFAULT_CURRENCY_CODE);
  const [incomes, setIncomes] = useState<IncomeEntry[]>(() => [
    { name: t('onboarding.income.defaultName'), amount: 0, frequency: 'monthly' },
  ]);
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [categories, setCategories] = useState<CategoryEntry[]>(() => getDefaultCategories(t));
  const [fixedPayments, setFixedPayments] = useState<FixedPaymentEntry[]>([]);

  const savedAccountIds = useRef<string[]>([]);
  const setCurrencyCode = useCurrencyStore((s) => s.setCurrencyCode);

  const {
    saveIncomes,
    saveAccounts,
    saveCategories,
    saveFixedPayments,
    completeOnboarding,
  } = useSaveOnboarding();

  const goNext = useCallback(async () => {
    switch (currentStep) {
      case 1:
        setCurrencyCode(selectedCurrencyCode);
        break;
      case 2:
        await saveIncomes(incomes);
        break;
      case 3: {
        const ids = await saveAccounts(accounts);
        savedAccountIds.current = ids;
        break;
      }
      case 4:
        await saveCategories(categories);
        break;
      case 5:
        await saveFixedPayments(fixedPayments);
        await completeOnboarding();
        return;
    }
    setCurrentStep((prev) => prev + 1);
  }, [
    currentStep,
    selectedCurrencyCode,
    incomes,
    accounts,
    categories,
    fixedPayments,
    setCurrencyCode,
    saveIncomes,
    saveAccounts,
    saveCategories,
    saveFixedPayments,
    completeOnboarding,
  ]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  switch (currentStep) {
    case 1:
      return (
        <CurrencyStep
          selectedCode={selectedCurrencyCode}
          onSelectCode={setSelectedCurrencyCode}
          onNext={goNext}
        />
      );
    case 2:
      return (
        <IncomeStep
          incomes={incomes}
          onChangeIncomes={setIncomes}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 3:
      return (
        <AccountsStep
          accounts={accounts}
          onChangeAccounts={setAccounts}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 4:
      return (
        <CategoriesStep
          categories={categories}
          onChangeCategories={setCategories}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 5:
      return (
        <FixedPaymentsStep
          payments={fixedPayments}
          onChangePayments={setFixedPayments}
          onNext={goNext}
          onBack={goBack}
          nextLabel={t('common.start')}
        />
      );
    default:
      return null;
  }
}
