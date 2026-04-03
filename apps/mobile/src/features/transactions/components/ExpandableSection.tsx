import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/hooks/useTheme';

const ANIMATION_DURATION_MS = 250;

interface ExpandableSectionProps {
  /** Section title displayed in the header. */
  title: string;
  /** Whether the section starts expanded. */
  initiallyExpanded?: boolean;
  /** Estimated max height of the children (used for animation). */
  estimatedHeight?: number;
  children: React.ReactNode;
  testID?: string;
}

/**
 * Collapsible section with animated expand/collapse.
 * Uses react-native-reanimated for smooth height transitions.
 */
export function ExpandableSection({
  title,
  initiallyExpanded = false,
  estimatedHeight = 200,
  children,
  testID = 'expandable-section',
}: ExpandableSectionProps) {
  const theme = useTheme();
  const expanded = useSharedValue(initiallyExpanded ? 1 : 0);
  const rotation = useSharedValue(initiallyExpanded ? 1 : 0);

  const toggle = useCallback(() => {
    const next = expanded.value === 1 ? 0 : 1;
    expanded.value = withTiming(next, { duration: ANIMATION_DURATION_MS });
    rotation.value = withTiming(next, { duration: ANIMATION_DURATION_MS });
  }, [expanded, rotation]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: expanded.value * estimatedHeight,
    opacity: expanded.value,
    overflow: 'hidden' as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        style={styles.header}
        onPress={toggle}
        testID={`${testID}-toggle`}
      >
        <Text
          style={[
            styles.headerText,
            { color: theme.moni.colors.foreground },
          ]}
        >
          {title}
        </Text>
        <Animated.Text
          style={[
            styles.chevron,
            { color: theme.moni.colors.mutedForeground },
            chevronStyle,
          ]}
        >
          ▼
        </Animated.Text>
      </Pressable>
      <Animated.View style={bodyStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 12,
  },
});
