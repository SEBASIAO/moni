import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import type { FormSheetRef } from '@/shared/components/FormSheet';

import { CardSection } from '../components/CardSection';
import { CardFormSheet } from '../components/CardFormSheet';
import { useCreditCardsData } from '../hooks/useCreditCardsData';

export function CreditCardsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing } = theme.moni;
  const insets = useSafeAreaInsets();
  const fmt = useFormatCurrency();
  const { cards, grandTotal } = useCreditCardsData();

  const formSheetRef = useRef<FormSheetRef>(null);
  const [editingCard, setEditingCard] = useState<{
    id: string;
    name: string;
    cutOffDay: number;
    paymentDay: number;
  } | null>(null);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
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

      {/* FAB - Add new card */}
      <Pressable
        onPress={() => {
          setEditingCard(null);
          formSheetRef.current?.open();
        }}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        testID="add-card-fab"
      >
        <Plus size={24} color={colors.onPrimary} />
      </Pressable>

      {/* Bottom sheet form */}
      <CardFormSheet
        ref={formSheetRef}
        card={editingCard}
        onSaved={() => {
          setEditingCard(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
