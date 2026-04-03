import { TextStyle } from 'react-native';

/**
 * Inter-based typography scale.
 * All money amounts must use fontVariant: ['tabular-nums'].
 */
export const typography = {
  hero: {
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 48,
  } satisfies TextStyle,

  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 28,
  } satisfies TextStyle,

  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.05,
    lineHeight: 24,
  } satisfies TextStyle,

  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
  } satisfies TextStyle,

  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.065,
    lineHeight: 18,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  amount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  amountSmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 16,
  } satisfies TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
