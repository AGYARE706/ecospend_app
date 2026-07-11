import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { EnvelopeFilter } from '../../types';

/**
 * Horizontal filter chips with status count badges for budget envelopes.
 */
export interface EnvelopeFilterRowProps {
  activeFilter: EnvelopeFilter;
  statusCounts: {
    healthy: number;
    atRisk: number;
    critical: number;
    exhausted: number;
  };
  onFilterChange: (filter: EnvelopeFilter) => void;
}

const FILTERS: Array<{
  key: EnvelopeFilter;
  countKey?: keyof EnvelopeFilterRowProps['statusCounts'];
}> = [
  { key: 'All' },
  { key: 'Healthy', countKey: 'healthy' },
  { key: 'At Risk', countKey: 'atRisk' },
  { key: 'Critical', countKey: 'critical' },
  { key: 'Exhausted', countKey: 'exhausted' },
];

export default function EnvelopeFilterRow({
  activeFilter,
  statusCounts,
  onFilterChange,
}: EnvelopeFilterRowProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = filter.countKey ? statusCounts[filter.countKey] : null;

        return (
          <Pressable
            key={filter.key}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipDefault]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text
              style={[styles.chipLabel, isActive ? styles.labelActive : styles.labelDefault]}
            >
              {filter.key}
            </Text>
            {count !== null ? (
              <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeDefault]}>
                <Text
                  style={[
                    styles.badgeText,
                    isActive ? styles.badgeTextActive : styles.badgeTextDefault,
                  ]}
                >
                  {count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipDefault: {
    backgroundColor: colors.chipBg,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  labelDefault: {
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.white,
  },
  badge: {
    borderRadius: radius.full,
    marginLeft: spacing.xs,
    minWidth: 20,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeDefault: {
    backgroundColor: colors.cardBackground,
  },
  badgeActive: {
    backgroundColor: colors.primaryDark,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  badgeTextDefault: {
    color: colors.textMuted,
  },
  badgeTextActive: {
    color: colors.white,
  },
});
