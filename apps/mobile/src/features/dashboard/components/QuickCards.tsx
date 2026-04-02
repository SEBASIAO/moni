import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

interface QuickCardItem {
  id: string;
  title: string;
  amount: number;
  label: string;
}

interface QuickCardsProps {
  cards: readonly QuickCardItem[];
}

export function QuickCards({ cards }: QuickCardsProps) {
  const { spacing } = useTheme().moni;

  return (
    <View style={[styles.grid, { paddingHorizontal: spacing.md, gap: spacing.sm }]}>
      {cards.map((card) => (
        <QuickCard key={card.id} card={card} />
      ))}
    </View>
  );
}

function QuickCard({ card }: { card: QuickCardItem }) {
  const { colors, typography: typo, spacing, radii } = useTheme().moni;
  const fmt = useFormatCurrency();

  return (
    <View
      testID={`quick-card-${card.id}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[typo.caption, { color: colors.mutedForeground }]}>
        {card.title}
      </Text>
      <Text style={[typo.amount, styles.cardAmount, { color: colors.cardForeground }]}>
        {fmt(card.amount)}
      </Text>
      <Text style={[typo.caption, { color: colors.mutedForeground }]}>
        {card.label}
      </Text>
    </View>
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
  cardAmount: {
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
});
