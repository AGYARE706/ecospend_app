import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, shadowSm, spacing } from '../../theme';

/**
 * title — button label text
 * onPress — callback when the button is pressed
 * loading — shows a spinner and disables interaction when true
 * disabled — disables the button without showing a spinner
 * variant — visual style: primary, text link, outline, or ghost
 * icon — optional Ionicons name rendered before the label
 * style — optional layout overrides for width/height in row layouts
 */
export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'text' | 'outline' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'text') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => pressed && styles.pressedText}
        hitSlop={spacing.sm}
      >
        <Text style={[styles.textButton, isDisabled && styles.textDisabled]}>
          {title}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.outlineButton,
          isDisabled && styles.buttonDisabled,
          pressed && styles.pressed,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.contentRow}>
            {icon ? (
              <Ionicons
                name={icon}
                size={fontSize.md}
                color={colors.primary}
                style={styles.icon}
              />
            ) : null}
            <Text style={styles.outlineTitle}>{title}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  if (variant === 'ghost') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.ghostButton,
          isDisabled && styles.buttonDisabled,
          pressed && styles.pressedText,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <Text style={styles.ghostTitle}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.buttonText} />
      ) : (
        <View style={styles.contentRow}>
          {icon ? (
            <Ionicons
              name={icon}
              size={fontSize.lg}
              color={colors.buttonText}
              style={styles.icon}
            />
          ) : null}
          <Text style={styles.buttonTitle}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    height: 54,
    justifyContent: 'center',
    width: '100%',
    ...shadowSm,
  },
  outlineButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.button,
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  ghostButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  pressedText: {
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
