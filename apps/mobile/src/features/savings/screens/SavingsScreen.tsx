import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { usePeriodStore } from '@/shared/store/periodStore';
import { database } from '@/database';
import type { Account } from '@/database/models/Account';

import { SavingItem } from '../components/SavingItem';
import { SavingFormSheet } from '../components/SavingFormSheet';
import { AddFundsSheet } from '../components/AddFundsSheet';
import { useSavingsData } from '../hooks/useSavingsData';
import type { SavingData } from '../hooks/useSavingsData';

export function SavingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing } = theme.moni;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { savings, totalSaved } = useSavingsData();
  const periodYear = usePeriodStore((s) => s.year);
  const periodMonth = usePeriodStore((s) => s.month);

  const formSheetRef = useRef<FormSheetRef>(null);
  const fundsSheetRef = useRef<FormSheetRef>(null);

  const [editingSaving, setEditingSaving] = useState<{
    id: string;
    name: string;
    targetAmount: number | null;
  } | null>(null);

  const [fundingSaving, setFundingSaving] = useState<SavingData | null>(null);

  const [accounts, setAccounts] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchAccounts() {
      const raw = await database
        .get<Account>('accounts')
        .query(Q.where('is_active', true), Q.where('type', Q.notEq('savings')))
        .fetch();
      if (!cancelled) {
        setAccounts(raw.map((a) => ({ id: a.id, label: a.name })));
      }
    }
    fetchAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFabPress = useCallback(() => {
    setEditingSaving(null);
    formSheetRef.current?.open();
  }, []);

  const handleSavingTap = useCallback((saving: SavingData) => {
    setFundingSaving(saving);
    fundsSheetRef.current?.open();
  }, []);

  const handleSavingLongPress = useCallback(
    (saving: SavingData) => {
      setEditingSaving({
        id: saving.id,
        name: saving.name,
        targetAmount: saving.targetAmount,
      });
      formSheetRef.current?.open();
    },
    [],
  );

  const handleSaved = useCallback(() => {
    setEditingSaving(null);
    setFundingSaving(null);
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            testID="savings-back"
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
            {t('savings.title')}
          </Text>
        </View>

        <View style={[styles.summaryRow, { marginBottom: spacing.lg }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {t('savings.totalSaved')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.positive }]}>
              {fmt(totalSaved)}
            </Text>
          </View>
        </View>

        {savings.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {t('savings.empty')}
          </Text>
        )}

        {savings.map((saving) => (
          <SavingItem
            key={saving.id}
            saving={saving}
            onPress={() => handleSavingTap(saving)}
            onLongPress={() => handleSavingLongPress(saving)}
          />
        ))}
      </ScrollView>

      <Pressable
        onPress={handleFabPress}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        testID="savings-add-fab"
      >
        <Plus size={24} color={colors.onPrimary} />
      </Pressable>

      <SavingFormSheet
        ref={formSheetRef}
        saving={editingSaving}
        onSaved={handleSaved}
      />

      <AddFundsSheet
        ref={fundsSheetRef}
        saving={fundingSaving}
        accounts={accounts}
        periodYear={periodYear}
        periodMonth={periodMonth}
        onSaved={handleSaved}
      />
    </KeyboardAvoidingView>
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
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
