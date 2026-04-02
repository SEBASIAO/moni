import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

import { CardSection } from '../components/CardSection';
import { useCreditCardsData } from '../hooks/useCreditCardsData';

export function CreditCardsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing } = theme.moni;
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { cards, grandTotal } = useCreditCardsData();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { padding: spacing.md }]}
    >
      <Text
        style={[
          typography.sectionHeader,
          { color: colors.foreground, marginBottom: spacing.lg },
        ]}
      >
        {t('creditCards.title')}
      </Text>

      <View style={[styles.heroContainer, { marginBottom: spacing.lg }]}>
        <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>
          {t('creditCards.totalToPayThisMonth')}
        </Text>
        <Text style={[styles.heroAmount, { color: colors.destructive }]}>
          {fmt(grandTotal)}
        </Text>
      </View>

      {cards.map((card) => (
        <CardSection key={card.id} card={card} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  heroContainer: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
    letterSpacing: -0.5,
  },
});
