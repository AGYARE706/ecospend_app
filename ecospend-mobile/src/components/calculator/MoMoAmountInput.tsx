import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

/**
 * Calculator-style amount input with large display typography and green underline.
 */
export interface MoMoAmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function MoMoAmountInput({ value, onChangeText }: MoMoAmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.amountRow}>
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
      </View>
      <View
        style={[
          styles.underline,
          isFocused ? styles.underlineFocused : styles.underlineDefault,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.md,
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
    fontSize: fontSize.amountDisplay,
    fontWeight: fontWeight.bold,
    minWidth: 140,
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
});
