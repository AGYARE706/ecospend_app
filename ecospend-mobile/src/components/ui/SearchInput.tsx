import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Icon } from './icons';

/**
 * Search field with leading SVG glyph and a clear affordance. Borders animate
 * to the brand color on focus for an active, premium feel.
 */
export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search transactions...',
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Icon name="search" size={20} color={isFocused ? colors.primary : colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={spacing.sm} accessibilityLabel="Clear search">
          <Icon name="x-circle" size={18} color={colors.textLight} filled />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  containerFocused: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  input: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
