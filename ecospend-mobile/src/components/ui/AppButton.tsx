import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * title — button label text
 * onPress — callback when the button is pressed
 * loading — shows a spinner and disables interaction when true
 * disabled — disables the button without showing a spinner
 * variant — 'primary' for filled green button, 'text' for link-style button
 */
export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'text';
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'text') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled}>
        <Text style={[styles.textButton, isDisabled && styles.textDisabled]}>
          {title}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.buttonText} />
      ) : (
        <Text style={styles.buttonTitle}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTitle: {
    color: colors.buttonText,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  textButton: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  textDisabled: {
    opacity: 0.6,
  },
});
