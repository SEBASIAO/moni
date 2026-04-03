import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/hooks/useTheme';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

const ANIMATION_DURATION = 300;

export function ProgressBar({ progress, height = 6 }: ProgressBarProps) {
  const theme = useTheme();
  const { colors, radii } = theme.moni;

  const clampedProgress = Math.min(progress, 1);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, {
      duration: ANIMATION_DURATION,
    });
  }, [clampedProgress, animatedWidth]);

  const barColor =
    progress >= 1
      ? colors.destructive
      : progress >= 0.8
        ? colors.warning
        : colors.positive;

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.muted,
          borderRadius: radii.full,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: barColor,
            borderRadius: radii.full,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
