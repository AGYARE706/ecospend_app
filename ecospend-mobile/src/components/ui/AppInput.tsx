import { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * label — field label displayed above the input
 * value — current text value
 * onChangeText — callback when text changes
 * placeholder — placeholder text shown when empty
 * keyboardType — keyboard type (e.g. 'phone-pad', 'default')
 * secureTextEntry — hides text for password fields
 * error — validation error message shown below the field
 * success — success hint shown below the field (with check affordance)
 * hint — neutral helper text shown when there's no error/success
 * leadingIcon — optional SVG icon rendered before the input
 * showToggle — shows an eye icon to toggle password visibility
 * multiline — enables multiline text input
 * numberOfLines — visible lines when multiline is enabled
 */
export interface AppInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  leadingIcon?: IconName | (string & {});
  showToggle?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  success,
  hint,
  leadingIcon,
  showToggle = false,
  multiline = false,
  numberOfLines = 1,
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !isPasswordVisible;
  const state: 'error' | 'success' | 'focused' | 'default' = error
    ? 'error'
    : success
      ? 'success'
      : isFocused
        ? 'focused'
        : 'default';

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, wrapperState[state]]}>
        {leadingIcon ? (
          <Icon
            name={leadingIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textLight}
          />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          keyboardType={keyboardType}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={!multiline}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {showToggle && secureTextEntry ? (
          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.trailing}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textGrey}
            />
          </Pressable>
        ) : state === 'error' ? (
          <Icon name="alert-circle" size={20} color={colors.error} />
        ) : state === 'success' ? (
          <Icon name="check-circle" size={20} color={colors.success} />
        ) : null}
      </View>

      {error ? (
        <View style={styles.helperRow}>
          <Icon name="alert-circle" size={14} color={colors.error} />
          <Text style={[styles.helperText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : success ? (
        <View style={styles.helperRow}>
          <Icon name="check-circle" size={14} color={colors.success} />
          <Text style={[styles.helperText, { color: colors.success }]}>{success}</Text>
        </View>
      ) : hint ? (
        <Text style={[styles.helperText, styles.hint]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const wrapperState = {
  default: { borderColor: colors.border },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  error: { borderColor: colors.error, backgroundColor: colors.errorLight },
  success: { borderColor: colors.success },
} as const;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.input,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  input: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 92,
    paddingTop: spacing.smd,
  },
  trailing: {
    marginLeft: spacing.xs,
  },
  helperRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  hint: {
    color: colors.textGrey,
    marginTop: spacing.xs,
  },
});
