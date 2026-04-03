import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';
import { stageRestore } from '@/shared/utils/backup';

import { SUPPORTED_CURRENCIES } from '@/shared/constants/currencies';

import type { Currency } from '@/shared/constants/currencies';

import { StepLayout } from './StepLayout';

interface CurrencyStepProps {
  selectedCode: string;
  onSelectCode: (code: string) => void;
  onNext: () => void;
  onBack?: () => void;
}

export function CurrencyStep({ selectedCode, onSelectCode, onNext, onBack }: CurrencyStepProps) {
  const { t } = useTranslation();
  const { colors, radii, spacing } = useTheme().moni;
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      await stageRestore();
      Alert.alert(t('backup.success'), t('backup.restoreSuccess'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('backup.importError');
      Alert.alert(t('backup.error'), message);
    } finally {
      setIsRestoring(false);
    }
  }, [t]);

  const renderItem = useCallback(
    ({ item }: { item: Currency }) => {
      const isSelected = item.code === selectedCode;

      return (
        <Pressable
          onPress={() => onSelectCode(item.code)}
          style={[
            styles.row,
            {
              backgroundColor: isSelected ? colors.primary : colors.card,
              borderRadius: radii.md,
              marginBottom: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
          testID={`currency-option-${item.code}`}
        >
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.name,
                { color: isSelected ? '#FFFFFF' : colors.cardForeground },
              ]}
            >
              {t(item.nameKey)}
            </Text>
            <Text
              style={[
                styles.code,
                { color: isSelected ? '#FFFFFF' : colors.mutedForeground },
              ]}
            >
              {item.code}
            </Text>
          </View>
        </Pressable>
      );
    },
    [selectedCode, onSelectCode, colors, radii, spacing],
  );

  const keyExtractor = useCallback((item: Currency) => item.code, []);

  return (
    <StepLayout
      step={1}
      onBack={onBack}
      title={t('onboarding.currency.title')}
      subtitle={t('onboarding.currency.subtitle')}
      onNext={onNext}
      headerRight={
        <Pressable
          onPress={handleRestore}
          disabled={isRestoring}
          hitSlop={8}
          testID="onboarding-restore"
        >
          <Text style={[styles.restoreText, { color: colors.primary }]}>
            {isRestoring ? t('backup.restoring') : t('backup.haveBackup')}
          </Text>
        </Pressable>
      }
    >
      <FlatList
        data={SUPPORTED_CURRENCIES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
      />
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  code: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
