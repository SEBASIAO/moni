import React from 'react';
import RNCurrencyInput from 'react-native-currency-input';
import type { StyleProp, TextStyle } from 'react-native';

import { useCurrencyStore } from '@/shared/store/currencyStore';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/currencies';

interface CurrencyInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  style?: StyleProp<TextStyle>;
  placeholder?: string;
  placeholderTextColor?: string;
  editable?: boolean;
  testID?: string;
}

/**
 * Currency-aware input that auto-formats with thousands separators.
 * Uses the currency selected in the store.
 */
export function CurrencyInput({
  value,
  onChangeValue,
  style,
  placeholder = '0',
  placeholderTextColor,
  editable = true,
  testID,
}: CurrencyInputProps) {
  const currencyCode = useCurrencyStore((s) => s.currencyCode);
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);

  // Determine separators based on locale
  const useCommaSeparator = currencyCode === 'BRL' || currencyCode === 'EUR';
  const separator = useCommaSeparator ? '.' : '.';
  const delimiter = useCommaSeparator ? ',' : '.';

  return (
    <RNCurrencyInput
      value={value}
      onChangeValue={(v) => onChangeValue(v ?? 0)}
      prefix={currency?.symbol ? `${currency.symbol} ` : '$ '}
      delimiter={delimiter}
      separator={separator}
      precision={0}
      minValue={0}
      style={style}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      editable={editable}
      testID={testID}
      keyboardType="number-pad"
    />
  );
}
