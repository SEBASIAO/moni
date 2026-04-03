import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronDown } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';

interface DropdownItem {
  id: string;
  label: string;
}

interface DropdownSelectProps {
  items: readonly DropdownItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
  placeholder?: string;
  testID?: string;
}

export function DropdownSelect({
  items,
  selectedId,
  onSelect,
  label,
  placeholder = 'Select…',
  testID = 'dropdown-select',
}: DropdownSelectProps) {
  const { colors, radii, spacing } = useTheme().moni;
  const [open, setOpen] = useState(false);

  const selected = items.find((i) => i.id === selectedId);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <View style={styles.container} testID={testID}>
      {label != null && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={[
          styles.trigger,
          {
            borderColor: open ? colors.primary : colors.border,
            backgroundColor: colors.muted,
            borderRadius: radii.md,
          },
        ]}
        testID={`${testID}-trigger`}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selected ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </Pressable>

      {open && (
        <View
          style={[
            styles.menu,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: radii.md,
            },
          ]}
        >
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item.id)}
                style={[
                  styles.menuItem,
                  isSelected && { backgroundColor: colors.muted },
                ]}
                testID={`${testID}-item-${item.id}`}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color: isSelected ? colors.primary : colors.foreground,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    fontWeight: '500',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  menu: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
});
