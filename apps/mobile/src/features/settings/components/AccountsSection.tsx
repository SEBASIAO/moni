import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Banknote, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/shared/hooks/useTheme';

interface AccountData {
  id: string;
  name: string;
  type: 'cash' | 'bank';
}

interface AccountsSectionProps {
  accounts: AccountData[];
  onAdd: () => void;
  onEdit: (account: AccountData) => void;
}

export function AccountsSection({ accounts, onAdd, onEdit }: AccountsSectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, typography, spacing, radii } = theme.moni;

  return (
    <View>
      <Text
        style={[
          typography.sectionHeader,
          { color: colors.foreground, marginBottom: spacing.sm },
        ]}
      >
        {t('accounts.title')}
      </Text>

      {accounts.length > 0 && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radii.lg,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          {accounts.map((account, index) => {
            const Icon = account.type === 'bank' ? Wallet : Banknote;
            const typeLabel =
              account.type === 'cash' ? t('accounts.cash') : t('accounts.bank');

            return (
              <Pressable
                key={account.id}
                onPress={() => onEdit(account)}
                style={[
                  styles.accountRow,
                  index < accounts.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                    paddingBottom: spacing.sm,
                    marginBottom: spacing.sm,
                  },
                ]}
                testID={`account-row-${account.id}`}
              >
                <Icon size={20} color={colors.mutedForeground} />
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: colors.cardForeground }]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountType, { color: colors.mutedForeground }]}>
                    {typeLabel}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable
        onPress={onAdd}
        style={[
          styles.addButton,
          { backgroundColor: colors.primary, borderRadius: radii.md },
        ]}
        testID="add-account-button"
      >
        <Text style={styles.addButtonText}>{t('accounts.addAccount')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  accountType: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
