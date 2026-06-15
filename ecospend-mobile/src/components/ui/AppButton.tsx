import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * title — button label text
 * onPress — callback when the button is pressed
 * loading — shows a spinner and disables interaction when true
 * disabled — disables the button without showing a spinner
 * variant — visual style: primary, text link, outline, or ghost
 * style — optional layout overrides for width/height in row layouts
 */
export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'text' | 'outline' | 'ghost';
  style?: ViewStyle;
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
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

  if (variant === 'outline') {
    return (
      <Pressable
        style={[styles.outlineButton, isDisabled && styles.buttonDisabled, style]}
        onPress={onPress}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.outlineTitle}>{title}</Text>
        )}
      </Pressable>
    );
  }

  if (variant === 'ghost') {
    return (
      <Pressable
        style={[styles.ghostButton, isDisabled && styles.buttonDisabled, style]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <Text style={styles.ghostTitle}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
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
  outlineButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  ghostButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTitle: {
    color: colors.buttonText,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  outlineTitle: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  ghostTitle: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
