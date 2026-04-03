import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Q } from '@nozbe/watermelondb';

import { database } from '@/database';
import type { Account } from '@/database/models/Account';
import type { FormSheetRef } from '@/shared/components/FormSheet';
import { useTheme } from '@/shared/hooks/useTheme';
import { useThemeStore } from '@/shared/hooks/useThemeStore';
import { useLanguageStore } from '@/shared/store/languageStore';
import { AccountFormSheet } from '@/features/settings/components/AccountFormSheet';
import { AccountsSection } from '@/features/settings/components/AccountsSection';
import { BackupSection } from '@/features/settings/components/BackupSection';

interface AccountData {
  id: string;
  name: string;
  type: 'cash' | 'bank';
}

export function MoreScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing, radii } = theme.moni;

  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const langPreference = useLanguageStore((s) => s.preference);
  const setLangPreference = useLanguageStore((s) => s.setPreference);

  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const formSheetRef = useRef<FormSheetRef>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      const raw = await database
        .get<Account>('accounts')
        .query(Q.where('is_active', true), Q.where('type', Q.notEq('credit_card')))
        .fetch();
      if (!cancelled) {
        setAccounts(
          raw.map((a) => ({ id: a.id, name: a.name, type: a.type as 'cash' | 'bank' })),
        );
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleAdd = useCallback(() => {
    setEditingAccount(null);
    formSheetRef.current?.open();
  }, []);

  const handleEdit = useCallback((account: AccountData) => {
    setEditingAccount(account);
    formSheetRef.current?.open();
  }, []);

  const handleSaved = useCallback(() => {
    formSheetRef.current?.close();
    setEditingAccount(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const chipStyle = (active: boolean) => [
    styles.chip,
    {
      backgroundColor: active ? colors.primary : 'transparent',
      borderColor: active ? colors.primary : colors.border,
    },
  ];

  const chipTextStyle = (active: boolean) => [
    styles.chipText,
    { color: active ? '#FFFFFF' : colors.foreground },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            typography.sectionHeader,
            { color: colors.foreground, marginBottom: spacing.lg },
          ]}
        >
          {t('settings.title')}
        </Text>

        {/* Theme */}
        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Text style={[styles.settingLabel, { color: colors.cardForeground }]}>
            {t('settings.theme')}
          </Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setThemePreference('system')}
              style={chipStyle(themePreference === 'system')}
              testID="theme-system"
            >
              <Text style={chipTextStyle(themePreference === 'system')}>
                {t('settings.system')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemePreference('light')}
              style={chipStyle(themePreference === 'light')}
              testID="theme-light"
            >
              <Text style={chipTextStyle(themePreference === 'light')}>
                {t('settings.light')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemePreference('dark')}
              style={chipStyle(themePreference === 'dark')}
              testID="theme-dark"
            >
              <Text style={chipTextStyle(themePreference === 'dark')}>
                {t('settings.dark')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Language */}
        <View
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Text style={[styles.settingLabel, { color: colors.cardForeground }]}>
            {t('settings.language')}
          </Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setLangPreference('system')}
              style={chipStyle(langPreference === 'system')}
              testID="language-system"
            >
              <Text style={chipTextStyle(langPreference === 'system')}>
                {t('settings.system')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLangPreference('es')}
              style={chipStyle(langPreference === 'es')}
              testID="language-es"
            >
              <Text style={chipTextStyle(langPreference === 'es')}>
                {t('settings.spanish')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLangPreference('en')}
              style={chipStyle(langPreference === 'en')}
              testID="language-en"
            >
              <Text style={chipTextStyle(langPreference === 'en')}>
                {t('settings.english')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Accounts */}
        <View style={{ marginTop: spacing.sm }}>
          <AccountsSection
            accounts={accounts}
            onAdd={handleAdd}
            onEdit={handleEdit}
          />
        </View>

        {/* Backup */}
        <View style={{ marginTop: spacing.sm }}>
          <BackupSection />
        </View>
      </ScrollView>

      <AccountFormSheet
        ref={formSheetRef}
        account={editingAccount}
        onSaved={handleSaved}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  settingCard: {},
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
