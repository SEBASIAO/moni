import React from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks/useTheme';

import { StepIndicator } from './StepIndicator';

const TOTAL_STEPS = 5;

interface StepLayoutProps {
  step: number;
  title: string;
  subtitle: string;
  onNext: () => void;
  onBack?: (() => void) | undefined;
  onSkip?: (() => void) | undefined;
  nextLabel?: string | undefined;
  headerRight?: ReactNode | undefined;
  children: ReactNode;
}

export function StepLayout({
  step,
  title,
  subtitle,
  onNext,
  onBack,
  onSkip,
  nextLabel,
  headerRight,
  children,
}: StepLayoutProps) {
  const { t } = useTranslation();
  const { colors, typography, radii } = useTheme().moni;
  const insets = useSafeAreaInsets();
  const resolvedNextLabel = nextLabel ?? t('common.next');

  return (
    <KeyboardAvoidingView
      style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topRow}>
        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        {headerRight != null && (
          <View style={styles.headerRightSlot}>{headerRight}</View>
        )}
      </View>

      <Text style={[typography.sectionHeader, styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.subtitle, { color: colors.mutedForeground }]}>
        {subtitle}
      </Text>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.leftActions}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.backButton} testID="step-back">
              <ChevronLeft size={24} color={colors.primary} />
            </Pressable>
          ) : null}
          {onSkip ? (
            <Pressable onPress={onSkip} style={styles.skipButton} testID="step-skip">
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                {t('common.skip')}
              </Text>
            </Pressable>
          ) : null}
          {!onBack && !onSkip ? <View /> : null}
        </View>
        <Pressable
          onPress={onNext}
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary, borderRadius: radii.md },
          ]}
        >
          <Text style={styles.nextText}>{resolvedNextLabel}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightSlot: {
    position: 'absolute',
    right: 24,
  },
  title: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  subtitle: {
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  skipText: {
    fontWeight: '500',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
