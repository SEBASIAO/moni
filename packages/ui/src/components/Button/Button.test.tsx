import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { Button } from './Button';
import { moniTheme } from '../../theme/theme';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider theme={moniTheme}>{children}</PaperProvider>
);

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Sign In</Button>, { wrapper });
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Tap me</Button>, { wrapper });
    fireEvent.press(screen.getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>,
      { wrapper },
    );
    fireEvent.press(screen.getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each([
    ['primary', 'contained'],
    ['secondary', 'contained-tonal'],
    ['outline', 'outlined'],
    ['ghost', 'text'],
  ] as const)('renders variant %s correctly', (variant, _mode) => {
    render(<Button variant={variant}>{variant}</Button>, { wrapper });
    expect(screen.getByText(variant)).toBeTruthy();
  });
});
