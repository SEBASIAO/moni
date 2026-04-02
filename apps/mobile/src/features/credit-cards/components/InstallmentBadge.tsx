import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

interface InstallmentBadgeProps {
  installmentNumber: number;
  totalInstallments: number;
}

export function InstallmentBadge({
  installmentNumber,
  totalInstallments,
}: InstallmentBadgeProps) {
  const theme = useTheme();
  const { colors, spacing } = theme.moni;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.muted,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs / 2,
          borderRadius: spacing.xs,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.mutedForeground },
        ]}
      >
        {installmentNumber}/{totalInstallments}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
