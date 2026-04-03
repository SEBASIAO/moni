import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';

import { useTheme } from '@/shared/hooks/useTheme';

export interface FormSheetRef {
  open: () => void;
  close: () => void;
}

interface FormSheetProps {
  title: string;
  children: React.ReactNode;
  /** Primary action button label. Hidden when omitted. */
  actionLabel?: string | undefined;
  /** Whether the primary action is enabled. */
  canSubmit?: boolean;
  /** Whether the primary action is in progress. */
  isSubmitting?: boolean;
  /** Called when the primary action button is pressed. */
  onSubmit?: (() => void) | undefined;
  /** Optional destructive action label (e.g. "Delete"). Shown only when provided. */
  destructiveLabel?: string | undefined;
  /** Called when the destructive button is pressed. */
  onDestructive?: (() => void) | undefined;
  /** Called when the sheet is closed (dismissed or X pressed). */
  onClose?: (() => void) | undefined;
}

export const FormSheet = forwardRef<FormSheetRef, FormSheetProps>(
  function FormSheet(
    {
      title,
      children,
      actionLabel,
      canSubmit,
      isSubmitting = false,
      onSubmit,
      destructiveLabel,
      onDestructive,
      onClose,
    },
    ref,
  ) {
    const theme = useTheme();
    const { colors, spacing } = theme.moni;
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['65%', '90%'], []);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => {
        Keyboard.dismiss();
        bottomSheetRef.current?.close();
      },
    }));

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
      onClose?.();
    }, [onClose]);

    const handleSubmit = useCallback(() => {
      if (!canSubmit || isSubmitting || onSubmit == null) return;
      Keyboard.dismiss();
      onSubmit();
    }, [canSubmit, isSubmitting, onSubmit]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        {...(onClose != null ? { onClose } : {})}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
      >
        <BottomSheetScrollView
          contentContainerStyle={[styles.content, { padding: spacing.md }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.title, { color: colors.foreground }]}>
              {title}
            </Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              style={styles.closeButton}
              testID="form-sheet-close"
            >
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Form content */}
          {children}

          {/* Primary action */}
          {actionLabel != null && (
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              style={[
                styles.actionButton,
                {
                  backgroundColor: canSubmit
                    ? colors.primary
                    : colors.muted,
                  marginTop: spacing.md,
                },
              ]}
              testID="form-sheet-submit"
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: canSubmit
                      ? colors.onPrimary
                      : colors.mutedForeground,
                  },
                ]}
              >
                {actionLabel}
              </Text>
            </Pressable>
          )}

          {/* Destructive action */}
          {destructiveLabel != null && onDestructive != null && (
            <Pressable
              onPress={onDestructive}
              style={[styles.destructiveButton, { marginTop: spacing.sm }]}
              testID="form-sheet-destructive"
            >
              <Text
                style={[styles.destructiveButtonText, { color: colors.destructive }]}
              >
                {destructiveLabel}
              </Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 22,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  destructiveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    fontWeight: '500',
  },
});
