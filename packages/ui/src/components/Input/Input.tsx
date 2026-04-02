import React from 'react';
import { TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

export interface InputProps extends TextInputProps {
  label: string;
}

/**
 * Moni Input component.
 * Wraps React Native Paper's TextInput with flat mode as default.
 */
export function Input({ label, mode = 'outlined', ...props }: InputProps) {
  return <TextInput label={label} mode={mode} {...props} />;
}
