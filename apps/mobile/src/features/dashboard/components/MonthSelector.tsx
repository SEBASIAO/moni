import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

const TOTAL_MONTHS = 12;

interface MonthSelectorProps {
  month: number;
  year: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthSelector({ month, year, onPrevious, onNext }: MonthSelectorProps) {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing } = useTheme().moni;

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const isFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1);

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      <Pressable
        testID="month-selector-prev"
        onPress={onPrevious}
        hitSlop={HIT_SLOP}
        style={styles.arrow}
      >
        <Text style={[styles.arrowText, { color: colors.primary }]}>{'‹'}</Text>
      </Pressable>

      <View style={styles.labelContainer}>
        <Text
          testID="month-selector-label"
          style={[typo.cardTitle, { color: colors.foreground }]}
        >
          {t(`months.${month}`)} {year}
        </Text>
        {isCurrentMonth && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{t('common.current')}</Text>
          </View>
        )}
      </View>

      <Pressable
        testID="month-selector-next"
        onPress={onNext}
        hitSlop={HIT_SLOP}
        style={styles.arrow}
        disabled={isFuture}
      >
        <Text
          style={[
            styles.arrowText,
            { color: isFuture ? colors.mutedForeground : colors.primary },
          ]}
        >
          {'›'}
        </Text>
      </Pressable>
    </View>
  );
}

function usePrevNextHandlers(
  month: number,
  year: number,
  setMonth: (m: number) => void,
  setYear: (y: number) => void,
) {
  const handlePrevious = () => {
    if (month === 1) {
      setMonth(TOTAL_MONTHS);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNext = () => {
    if (month === TOTAL_MONTHS) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return { handlePrevious, handleNext };
}

export { usePrevNextHandlers };

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '600',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
