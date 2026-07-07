import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Shared modal shell for envelope bottom sheets with overlay and keyboard handling.
 */
export interface EnvelopeSheetContainerProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function EnvelopeSheetContainer({
  visible,
  onClose,
  children,
}: EnvelopeSheetContainerProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            <View style={styles.handleBar} />
            <ScrollView
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '90%',
    paddingTop: spacing.sm,
  },
  handleBar: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: spacing.xs,
    marginBottom: spacing.md,
    width: spacing.xxl,
  },
  content: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
