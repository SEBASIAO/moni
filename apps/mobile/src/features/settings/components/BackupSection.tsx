import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';
import { exportBackup, stageRestore } from '@/shared/utils/backup';

export function BackupSection() {
  const { t } = useTranslation();
  const { colors, spacing, radii } = useTheme().moni;
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportBackup();
      Alert.alert(t('backup.success'), t('backup.exportSuccess', { fileName: result.fileName }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('backup.exportError');
      Alert.alert(t('backup.error'), message);
    } finally {
      setIsExporting(false);
    }
  }, [t]);

  const handleImport = useCallback(() => {
    Alert.alert(
      t('backup.restoreTitle'),
      t('backup.restoreWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('backup.restore'),
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              await stageRestore();
              Alert.alert(t('backup.success'), t('backup.restoreSuccess'));
            } catch (err) {
              const message = err instanceof Error ? err.message : t('backup.importError');
              Alert.alert(t('backup.error'), message);
            } finally {
              setIsImporting(false);
            }
          },
        },
      ],
    );
  }, [t]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.cardForeground }]}>
        {t('backup.title')}
      </Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        {t('backup.description')}
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleExport}
          disabled={isExporting || isImporting}
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: radii.md,
              opacity: isExporting ? 0.6 : 1,
            },
          ]}
          testID="backup-export"
        >
          <Text style={styles.buttonText}>
            {isExporting ? t('backup.exporting') : t('backup.export')}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleImport}
          disabled={isExporting || isImporting}
          style={[
            styles.button,
            {
              backgroundColor: 'transparent',
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: isImporting ? 0.6 : 1,
            },
          ]}
          testID="backup-import"
        >
          <Text style={[styles.buttonTextOutline, { color: colors.foreground }]}>
            {isImporting ? t('backup.restoring') : t('backup.restore')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextOutline: {
    fontWeight: '600',
    fontSize: 14,
  },
});
