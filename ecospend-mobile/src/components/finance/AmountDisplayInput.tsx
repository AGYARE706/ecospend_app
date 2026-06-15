import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

/**
 * value — raw amount string entered by the user
 * onChangeText — callback when amount text changes
 * error — validation error message shown below the input
 */
export interface AmountDisplayInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export default function AmountDisplayInput({
  value,
  onChangeText,
  error,
}: AmountDisplayInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable style={styles.amountRow}>
        <Text style={styles.currencyLabel}>GHS</Text>
        <TextInput
          style={styles.amountInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Pressable>
      <View
        style={[
          styles.underline,
          isFocused ? styles.underlineFocused : styles.underlineDefault,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  currencyLabel: {
    color: colors.textGrey,
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  amountInput: {
    color: colors.textDark,
    fontSize: fontSize.amountHero,
    fontWeight: fontWeight.bold,
    minWidth: 120,
    textAlign: 'center',
  },
  underline: {
    height: 2,
    marginTop: spacing.sm,
    width: '70%',
  },
  underlineDefault: {
    backgroundColor: colors.border,
  },
  underlineFocused: {
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
