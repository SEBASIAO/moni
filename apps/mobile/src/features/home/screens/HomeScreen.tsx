import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@moni/ui/theme';
import { useAuthStore } from '@/features/auth/store/authStore';

export function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Hola, {user?.profile?.fullName ?? user?.email ?? 'Usuario'} 👋
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Bienvenido a tu aplicación Moni.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
  },
});
