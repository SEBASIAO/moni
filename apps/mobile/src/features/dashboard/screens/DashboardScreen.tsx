import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';

import type { RootStackParamList, AppTabParamList } from '@/app/navigation/types';
import { useTheme } from '@/shared/hooks/useTheme';

import type { FormSheetRef } from '@/shared/components/FormSheet';
import { HeroBalance } from '../components/HeroBalance';
import { MonthSelector, usePrevNextHandlers } from '../components/MonthSelector';
import { QuickCards } from '../components/QuickCards';
import { RecentTransactions } from '../components/RecentTransactions';
import { TransactionDetailSheet } from '../components/TransactionDetailSheet';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  RegisterExpenseSheet,
  type RegisterExpenseSheetRef,
} from '@/features/transactions/components/RegisterExpenseSheet';

const FAB_SIZE = 56;
const FAB_RADIUS = FAB_SIZE / 2;

export function DashboardScreen() {
  const theme = useTheme();
  const { colors, spacing } = theme.moni;
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation = useNavigation<NativeStackNavigationProp<AppTabParamList>>();

  const handleQuickCardPress = useCallback(
    (cardId: string) => {
      switch (cardId) {
        case 'income':
          rootNavigation.navigate('Incomes');
          break;
        case 'fixed':
          rootNavigation.navigate('FixedPayments');
          break;
        case 'credit':
          tabNavigation.navigate('CreditCards');
          break;
        case 'expenses':
          tabNavigation.navigate('Budget');
          break;
        case 'savings':
          rootNavigation.navigate('Savings');
          break;
      }
    },
    [rootNavigation, tabNavigation],
  );

  const {
    month,
    year,
    setMonth,
    setYear,
    disponibleReal,
    isDisponiblePositive,
    saldoActual,
    isSaldoPositive,
    quickCards,
    recentTransactions,
    categories,
    accounts,
    fixedPayments,
  } = useDashboardData();

  const sheetRef = useRef<RegisterExpenseSheetRef>(null);
  const detailSheetRef = useRef<FormSheetRef>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<{
    id: string;
    description: string;
    category: string;
    account: string;
    amount: number;
    date: number;
    note: string | null;
  } | null>(null);

  const handleTransactionPress = useCallback((tx: {
    id: string;
    description: string;
    category: string;
    account: string;
    amount: number;
    date: number;
    note: string | null;
  }) => {
    setSelectedTransaction(tx);
    detailSheetRef.current?.open();
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.name, type: c.type })),
    [categories],
  );

  const accountOptions = useMemo(
    () => accounts.map((a) => ({ id: a.id, label: a.name, type: a.type })),
    [accounts],
  );

  const pendingFixedPayments = useMemo(
    () => fixedPayments
      .filter((fp) => !fp.isPaid)
      .map((fp) => ({ id: fp.id, name: fp.name, amount: fp.budgetedAmount })),
    [fixedPayments],
  );

  const { handlePrevious, handleNext } = usePrevNextHandlers(
    month,
    year,
    setMonth,
    setYear,
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        testID="dashboard-scroll"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing['2xl'] + FAB_SIZE }]}
        showsVerticalScrollIndicator={false}
      >
        <MonthSelector
          month={month}
          year={year}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <HeroBalance
          disponibleReal={disponibleReal}
          isDisponiblePositive={isDisponiblePositive}
          saldoActual={saldoActual}
          isSaldoPositive={isSaldoPositive}
        />

        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <QuickCards cards={quickCards} onCardPress={handleQuickCardPress} />
        </View>

        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <RecentTransactions
            transactions={recentTransactions}
            onTransactionPress={handleTransactionPress}
            onSeeAll={() => rootNavigation.navigate('Transactions')}
          />
        </View>
      </ScrollView>

      <Pressable
        testID="fab-add"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => sheetRef.current?.open()}
      >
        <Plus size={24} color={colors.onPrimary} />
      </Pressable>

      <RegisterExpenseSheet
        ref={sheetRef}
        categories={categoryOptions}
        accounts={accountOptions}
        pendingFixedPayments={pendingFixedPayments}
        periodYear={year}
        periodMonth={month}
      />

      <TransactionDetailSheet
        ref={detailSheetRef}
        transaction={selectedTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
