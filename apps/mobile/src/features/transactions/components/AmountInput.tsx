import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

interface AmountInputProps {
  /** Raw integer amount in COP (no decimals). */
  value: number;
  /** Called with the new integer amount whenever the user types. */
  onChangeAmount: (amount: number) => void;
  /** Whether the input should auto-focus on mount. */
  autoFocus?: boolean;
  testID?: string;
}

const MAX_AMOUNT = 999_999_999;

/**
 * Large numeric input styled for monetary amounts.
 * Shows the formatted currency value directly.
 * Uses a hidden TextInput for keyboard interaction.
 */
export function AmountInput({
  value,
  onChangeAmount,
  autoFocus = true,
  testID = 'amount-input',
}: AmountInputProps) {
  const theme = useTheme();
  const fmt = useFormatCurrency();
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '');
      const parsed = digits === '' ? 0 : parseInt(digits, 10);
      if (parsed <= MAX_AMOUNT) {
        onChangeAmount(parsed);
      }
    },
    [onChangeAmount],
  );

  return (
    <View style={styles.container}>
      <Text
        style={[styles.display, { color: value > 0 ? theme.moni.colors.foreground : theme.moni.colors.mutedForeground }]}
        onPress={() => inputRef.current?.focus()}
      >
        {value > 0 ? fmt(value) : '$ 0'}
      </Text>
      <TextInput
        ref={inputRef}
        testID={testID}
        style={styles.hiddenInput}
        value={value === 0 ? '' : String(value)}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        autoFocus={autoFocus}
        maxLength={10}
        caretHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  display: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    fontVariant: ['tabular-nums'],
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});
