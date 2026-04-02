import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '@/shared/hooks/useTheme';

import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';

interface AmountInputProps {
  /** Raw integer amount in COP (no decimals). */
  value: number;
  /** Called with the new integer amount whenever the user types. */
  onChangeAmount: (amount: number) => void;
  /** Placeholder shown when value is 0. */
  placeholder?: string;
  /** Whether the input should auto-focus on mount. */
  autoFocus?: boolean;
  testID?: string;
}

const MAX_AMOUNT = 999_999_999;

/**
 * Large numeric input styled for monetary amounts.
 * Displays the formatted COP value below the raw input.
 */
export function AmountInput({
  value,
  onChangeAmount,
  placeholder = '0',
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

  const displayValue = value === 0 ? '' : String(value);

  const dynamicInputStyle = {
    color: theme.moni.colors.foreground,
  } as const;

  const dynamicHintStyle = {
    color: theme.moni.colors.mutedForeground,
  } as const;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text
          style={[
            styles.currencySign,
            { color: theme.moni.colors.mutedForeground },
          ]}
        >
          $
        </Text>
        <TextInput
          ref={inputRef}
          testID={testID}
          style={[styles.input, dynamicInputStyle]}
          value={displayValue}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.moni.colors.mutedForeground}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          maxLength={10}
          selectionColor={theme.moni.colors.primary}
          returnKeyType="done"
        />
      </View>
      {value > 0 && (
        <Text style={[styles.formattedHint, dynamicHintStyle]}>
          {fmt(value)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySign: {
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginRight: 4,
  },
  input: {
    fontSize: 40,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    fontVariant: ['tabular-nums'],
    minWidth: 40,
    padding: 0,
    textAlign: 'center',
  },
  formattedHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
});
