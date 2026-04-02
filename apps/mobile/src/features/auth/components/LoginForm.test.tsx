import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

import { LoginForm } from './LoginForm';

jest.mock('@moni/ui/components', () => {
  const React = require('react');
  const { Text, TextInput } = require('react-native');

  return {
    Input: ({ testID, value, onChangeText }: { testID?: string; value?: string; onChangeText?: (text: string) => void }) => (
      <TextInput testID={testID} value={value} onChangeText={onChangeText} />
    ),
    Button: ({
      children,
      disabled,
      onPress,
      testID,
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      onPress?: () => void;
      testID?: string;
    }) => (
      <Text testID={testID} disabled={disabled} onPress={disabled ? undefined : onPress}>
        {children}
      </Text>
    ),
  };
});

jest.mock('@moni/ui/theme', () => ({
  spacing: {
    base: 16,
  },
}));

jest.mock('react-native-paper', () => ({
  Text: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, children);
  },
}));

// Mock hooks to isolate the component
jest.mock('../hooks/useLogin', () => ({
  useLogin: jest.fn(() => ({
    login: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

import { useLogin } from '../hooks/useLogin';

const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    mockUseLogin.mockReturnValue({ login: jest.fn(), isPending: false, error: null });
    render(<LoginForm />);
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
  });

  it('renders submit button', () => {
    mockUseLogin.mockReturnValue({ login: jest.fn(), isPending: false, error: null });
    render(<LoginForm />);
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });

  it('calls login with email and password on submit', async () => {
    const loginFn = jest.fn().mockResolvedValueOnce(undefined);
    mockUseLogin.mockReturnValue({ login: loginFn, isPending: false, error: null });

    render(<LoginForm />);

    fireEvent.changeText(screen.getByTestId('email-input'), 'test@moni.co');
    fireEvent.changeText(screen.getByTestId('password-input'), 'secret123');
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('test@moni.co', 'secret123');
    });
  });

  it('shows error message when login fails', () => {
    mockUseLogin.mockReturnValue({
      login: jest.fn(),
      isPending: false,
      error: new Error('Credenciales inválidas'),
    });

    render(<LoginForm />);
    expect(screen.getByText('Credenciales inválidas')).toBeTruthy();
  });

  it('disables submit button while loading', () => {
    mockUseLogin.mockReturnValue({ login: jest.fn(), isPending: true, error: null });
    render(<LoginForm />);
    expect(screen.getByTestId('login-button').props.disabled).toBe(true);
  });
});
