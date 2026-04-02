import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@moni/ui/theme';

export function SignUpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Crear cuenta
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Únete a Moni
        </Text>
      </View>
      {/* TODO: Add SignUpForm component */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
  },
  header: {
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
  },
});
