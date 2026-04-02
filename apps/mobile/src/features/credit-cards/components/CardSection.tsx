import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

import type { CreditCardData } from '../hooks/useCreditCardsData';
import { InstallmentBadge } from './InstallmentBadge';

interface CardSectionProps {
  card: CreditCardData;
}

export function CardSection({ card }: CardSectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, spacing, typography, radii } = theme.moni;
  const fmt = useFormatCurrency();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const { subscriptions, installments, purchases } = card.sections;

  const hasSubscriptions = subscriptions.length > 0;
  const hasInstallments = installments.length > 0;
  const hasPurchases = purchases.length > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <Pressable
        onPress={toggle}
        style={styles.header}
        testID={`card-section-header-${card.id}`}
      >
        <Text style={[typography.cardTitle, { color: colors.cardForeground }]}>
          {card.name}
        </Text>
        <Text style={[styles.cardTotal, { color: colors.destructive }]}>
          {fmt(card.total)}
        </Text>
      </Pressable>

      {expanded && (
        <View style={[styles.details, { marginTop: spacing.md }]}>
          {hasSubscriptions && (
            <View style={[styles.section, { marginBottom: spacing.md }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.mutedForeground, marginBottom: spacing.sm },
                ]}
              >
                {t('creditCards.subscriptions')}
              </Text>
              {subscriptions.map((sub) => (
                <View key={sub.id} style={styles.row}>
                  <Text style={[typography.body, { color: colors.cardForeground, flex: 1 }]}>
                    {sub.description}
                  </Text>
                  <Text style={[styles.amount, { color: colors.cardForeground }]}>
                    {fmt(sub.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {hasInstallments && (
            <View style={[styles.section, { marginBottom: spacing.md }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.mutedForeground, marginBottom: spacing.sm },
                ]}
              >
                {t('creditCards.installments')}
              </Text>
              {installments.map((inst) => (
                <View key={inst.id} style={styles.row}>
                  <Text style={[typography.body, { color: colors.cardForeground, flex: 1 }]}>
                    {inst.description}
                  </Text>
                  <View style={styles.installmentAmount}>
                    <InstallmentBadge
                      installmentNumber={inst.installmentNumber}
                      totalInstallments={inst.totalInstallments}
                    />
                    <Text style={[styles.amount, { color: colors.cardForeground, marginLeft: spacing.sm }]}>
                      {fmt(inst.amount)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {hasPurchases && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.mutedForeground, marginBottom: spacing.sm },
                ]}
              >
                {t('creditCards.monthlyPurchases')}
              </Text>
              {purchases.map((purchase) => (
                <View key={purchase.id} style={styles.row}>
                  <Text style={[typography.body, { color: colors.cardForeground, flex: 1 }]}>
                    {purchase.description}
                  </Text>
                  <Text style={[styles.amount, { color: colors.cardForeground }]}>
                    {fmt(purchase.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTotal: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  details: {},
  section: {},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  installmentAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
