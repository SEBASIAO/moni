import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

export interface QuickCardItem {
  id: string;
  title: string;
  amount: number;
  label: string;
}

interface QuickCardsProps {
  cards: readonly QuickCardItem[];
  onCardPress?: (cardId: string) => void;
}

export function QuickCards({ cards, onCardPress }: QuickCardsProps) {
  const { spacing } = useTheme().moni;

  return (
    <View style={[styles.grid, { paddingHorizontal: spacing.md, gap: spacing.sm }]}>
      {cards.map((card) => (
        <QuickCard
          key={card.id}
          card={card}
          onPress={onCardPress != null ? () => onCardPress(card.id) : undefined}
        />
      ))}
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SCALE = 0.97;
const PRESS_DURATION = 120;

function QuickCard({
  card,
  onPress,
}: {
  card: QuickCardItem;
  onPress?: (() => void) | undefined;
}) {
  const { colors, typography: typo, spacing, radii } = useTheme().moni;
  const fmt = useFormatCurrency();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress != null) {
      scale.value = withTiming(PRESS_SCALE, { duration: PRESS_DURATION });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: PRESS_DURATION });
  };

  return (
    <AnimatedPressable
      testID={`quick-card-${card.id}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[typo.caption, { color: colors.mutedForeground, flex: 1 }]}>
          {card.title}
        </Text>
        {onPress != null && (
          <ChevronRight size={14} color={colors.mutedForeground} />
        )}
      </View>
      <Text style={[typo.amount, styles.cardAmount, { color: colors.cardForeground }]}>
        {fmt(card.amount)}
      </Text>
      <Text style={[typo.caption, { color: colors.mutedForeground }]}>
        {card.label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardAmount: {
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
});
