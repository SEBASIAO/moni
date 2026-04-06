import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

import type { SavingData } from '../hooks/useSavingsData';

interface SavingItemProps {
  saving: SavingData;
  onPress: () => void;
  onLongPress: () => void;
}

export function SavingItem({ saving, onPress, onLongPress }: SavingItemProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, radii } = theme.moni;
  const fmt = useFormatCurrency();

  const hasTarget = saving.targetAmount != null && saving.targetAmount > 0;
  const progressPercent = hasTarget
    ? Math.min(100, (saving.currentAmount / saving.targetAmount!) * 100)
    : 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      testID={`saving-item-${saving.id}`}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {saving.name}
          </Text>
          {hasTarget && (
            <>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.muted, borderRadius: radii.sm, marginTop: spacing.xs },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.positive,
                      borderRadius: radii.sm,
                      width: `${progressPercent}%` as unknown as number,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                {fmt(saving.currentAmount)} {t('savings.of')} {fmt(saving.targetAmount!)}
              </Text>
            </>
          )}
        </View>
        <Text style={[styles.amount, { color: colors.foreground }]}>
          {fmt(saving.currentAmount)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
  },
  progressText: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
});
