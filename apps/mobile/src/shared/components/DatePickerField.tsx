import React, { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { formatShortDate } from '@/shared/utils/formatters';

interface DatePickerFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  testID?: string;
}

/** Create a Date at noon local for the given date — safe from timezone day shifts. */
function noonLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

export function DatePickerField({
  value,
  onChange,
  label,
  testID = 'date-picker',
}: DatePickerFieldProps) {
  const { colors, radii } = useTheme().moni;
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(() => noonLocal(value));

  const handleOpen = useCallback(() => {
    setTempDate(noonLocal(value));
    setOpen(true);
  }, [value]);

  const handleConfirm = useCallback(() => {
    onChange(noonLocal(tempDate));
    setOpen(false);
  }, [tempDate, onChange]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleChange = useCallback(
    (_event: unknown, selectedDate: Date | undefined) => {
      if (selectedDate == null) {
        if (Platform.OS === 'android') setOpen(false);
        return;
      }

      if (Platform.OS === 'android') {
        setOpen(false);
        onChange(noonLocal(selectedDate));
        return;
      }

      // iOS spinner — store temp, confirm on OK
      setTempDate(noonLocal(selectedDate));
    },
    [onChange],
  );

  return (
    <View style={styles.container} testID={testID}>
      {label != null && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
      )}

      <Pressable
        onPress={handleOpen}
        style={[
          styles.trigger,
          {
            borderColor: colors.border,
            backgroundColor: colors.muted,
            borderRadius: radii.md,
          },
        ]}
        testID={`${testID}-trigger`}
      >
        <Calendar size={18} color={colors.mutedForeground} />
        <Text style={[styles.triggerText, { color: colors.foreground }]}>
          {formatShortDate(value)}
        </Text>
      </Pressable>

      {Platform.OS === 'android' && open && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={noonLocal(new Date())}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={open} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancel} hitSlop={12}>
                  <Text style={[styles.modalAction, { color: colors.mutedForeground }]}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable onPress={handleConfirm} hitSlop={12}>
                  <Text style={[styles.modalAction, { color: colors.primary }]}>
                    OK
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                maximumDate={noonLocal(new Date())}
                textColor={colors.foreground}
              />
            </View>
          </View>
        </Modal>
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
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalAction: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
});
