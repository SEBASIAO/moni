import React, { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

interface ChipItem {
  id: string;
  label: string;
}

interface ChipSelectorProps {
  /** Items to render as chips. */
  items: readonly ChipItem[];
  /** Currently selected item id (single-select). */
  selectedId: string | null;
  /** Called when the user taps a chip. */
  onSelect: (id: string) => void;
  /** Optional label displayed above the chip row. */
  label?: string;
  testID?: string;
}

/**
 * Horizontal scrollable row of selectable chips.
 * Single-select: tapping a chip calls `onSelect` with its id.
 */
export function ChipSelector({
  items,
  selectedId,
  onSelect,
  label,
  testID = 'chip-selector',
}: ChipSelectorProps) {
  const theme = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: ChipItem }) => {
      const isSelected = item.id === selectedId;

      const chipStyle = isSelected
        ? {
            backgroundColor: theme.moni.colors.primary,
            borderColor: theme.moni.colors.primary,
          }
        : {
            backgroundColor: theme.moni.colors.transparent,
            borderColor: theme.moni.colors.border,
          };

      const textColor = isSelected
        ? theme.moni.colors.onPrimary
        : theme.moni.colors.foreground;

      return (
        <Pressable
          testID={`${testID}-chip-${item.id}`}
          onPress={() => onSelect(item.id)}
          style={[styles.chip, chipStyle]}
        >
          <Text style={[styles.chipText, { color: textColor }]}>
            {item.label}
          </Text>
        </Pressable>
      );
    },
    [selectedId, onSelect, theme, testID],
  );

  const keyExtractor = useCallback((item: ChipItem) => item.id, []);

  return (
    <View style={styles.container} testID={testID}>
      {label != null && (
        <Text
          style={[
            styles.label,
            { color: theme.moni.colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      )}
      <FlatList
        data={items as ChipItem[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.065,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
});
