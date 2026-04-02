import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import type { ButtonProps as PaperButtonProps } from 'react-native-paper';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends Omit<PaperButtonProps, 'mode'> {
  variant?: ButtonVariant;
}

const variantToMode: Record<ButtonVariant, NonNullable<PaperButtonProps['mode']>> = {
  primary: 'contained',
  secondary: 'contained-tonal',
  outline: 'outlined',
  ghost: 'text',
};

/**
 * Moni Button component.
 * Wraps React Native Paper's Button with preset variants.
 */
export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <PaperButton mode={variantToMode[variant]} {...props}>
      {children}
    </PaperButton>
  );
}
