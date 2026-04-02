import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Button, Input } from '@moni/ui/components';
import { spacing } from '@moni/ui/theme';

import { useLogin } from '../hooks/useLogin';

interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * Mobile login form component.
 * Uses shared UI components from @moni/ui.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isPending, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit() {
    try {
      await login(email, password);
      onSuccess?.();
    } catch {
      // Error is handled by useLogin
    }
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error.message}</Text>}

      <Input
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        testID="email-input"
      />

      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        testID="password-input"
      />

      <Button
        variant="primary"
        onPress={handleSubmit}
        loading={isPending}
        disabled={isPending}
        testID="login-button"
      >
        Ingresar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  error: {
    color: '#B00020',
    fontSize: 14,
  },
});
