import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PROVIDERS } from '../../constants/categories';
import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { Provider } from '../../types';

/**
 * selectedProvider — currently selected mobile money provider
 * onSelect — callback when a provider chip is selected
 */
export interface ProviderChipRowProps {
  selectedProvider: Provider | null;
  onSelect: (provider: Provider) => void;
}

export default function ProviderChipRow({
  selectedProvider,
  onSelect,
}: ProviderChipRowProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {PROVIDERS.map((provider) => {
        const isSelected = selectedProvider === provider;

        return (
          <Pressable
            key={provider}
            style={[styles.chip, isSelected ? styles.chipSelected : styles.chipDefault]}
            onPress={() => onSelect(provider)}
          >
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelDefault,
              ]}
            >
              {provider}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipDefault: {
    backgroundColor: colors.chipBg,
    borderColor: colors.chipBg,
  },
  chipSelected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  labelDefault: {
    color: colors.textGrey,
  },
  labelSelected: {
    color: colors.primary,
  },
});
