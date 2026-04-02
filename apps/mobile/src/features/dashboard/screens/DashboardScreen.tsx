import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { HeroBalance } from '../components/HeroBalance';
import { MonthSelector, usePrevNextHandlers } from '../components/MonthSelector';
import { QuickCards } from '../components/QuickCards';
import { RecentTransactions } from '../components/RecentTransactions';
import { useDashboardData } from '../hooks/useDashboardData';

const FAB_SIZE = 56;
const FAB_RADIUS = FAB_SIZE / 2;

export function DashboardScreen() {
  const theme = useTheme();
  const { colors, spacing } = theme.moni;
  const insets = useSafeAreaInsets();

  const {
    month,
    year,
    setMonth,
    setYear,
    balance,
    isPositive,
    quickCards,
    recentTransactions,
  } = useDashboardData();

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

        <HeroBalance balance={balance} isPositive={isPositive} />

        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <QuickCards cards={quickCards} />
        </View>

        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <RecentTransactions transactions={recentTransactions} />
        </View>
      </ScrollView>

      <Pressable
        testID="fab-add"
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            borderRadius: FAB_RADIUS,
            bottom: spacing.lg,
            right: spacing.md,
          },
        ]}
      >
        <Text style={[styles.fabIcon, { color: colors.onPrimary }]}>+</Text>
      </Pressable>
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
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
});
