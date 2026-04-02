import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';
import { useLanguageStore } from '@/shared/store/languageStore';

export function MoreScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing, radii } = theme.moni;
  const { language, setLanguage } = useLanguageStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { padding: spacing.md }]}>
        <Text style={[typography.sectionHeader, { color: colors.foreground, marginBottom: spacing.lg }]}>
          {t('settings.title')}
        </Text>

        <View
          style={[
            styles.settingRow,
            {
              backgroundColor: colors.card,
              borderRadius: radii.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Text style={[styles.settingLabel, { color: colors.cardForeground }]}>
            {t('settings.language')}
          </Text>
          <View style={styles.languageChips}>
            <Pressable
              onPress={() => setLanguage('es')}
              style={[
                styles.chip,
                {
                  backgroundColor: language === 'es' ? colors.primary : 'transparent',
                  borderColor: language === 'es' ? colors.primary : colors.border,
                },
              ]}
              testID="language-es"
            >
              <Text
                style={[
                  styles.chipText,
                  { color: language === 'es' ? '#FFFFFF' : colors.foreground },
                ]}
              >
                {t('settings.spanish')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLanguage('en')}
              style={[
                styles.chip,
                {
                  backgroundColor: language === 'en' ? colors.primary : 'transparent',
                  borderColor: language === 'en' ? colors.primary : colors.border,
                },
              ]}
              testID="language-en"
            >
              <Text
                style={[
                  styles.chipText,
                  { color: language === 'en' ? '#FFFFFF' : colors.foreground },
                ]}
              >
                {t('settings.english')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageChips: {
    flexDirection: 'row',
    gap: 8,
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
