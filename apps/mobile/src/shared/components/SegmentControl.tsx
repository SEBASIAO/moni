import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

interface Segment {
  key: string;
  label: string;
}

interface SegmentControlProps {
  segments: readonly Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
  testID?: string;
}

export function SegmentControl({
  segments,
  selectedKey,
  onSelect,
  testID = 'segment-control',
}: SegmentControlProps) {
  const { colors, radii } = useTheme().moni;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.muted, borderRadius: radii.lg }]}
      testID={testID}
    >
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey;
        return (
          <Pressable
            key={segment.key}
            onPress={() => onSelect(segment.key)}
            style={[
              styles.segment,
              { borderRadius: radii.md },
              isSelected && {
                backgroundColor: colors.card,
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              },
            ]}
            testID={`${testID}-${segment.key}`}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? colors.foreground : colors.mutedForeground },
                isSelected && { fontWeight: '600' },
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
});
