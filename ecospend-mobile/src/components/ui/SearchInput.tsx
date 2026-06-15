import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '../../theme';

/**
 * Search field with icon for filtering transaction lists.
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
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={fontSize.lg}
        color={colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
  },
});
