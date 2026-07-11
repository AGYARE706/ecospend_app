import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  spacing,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Fee breakdown card with placeholder state or animated result rows.
 */
export interface FeeResultCardProps {
  hasResult: boolean;
  amount: number;
  fee: number;
  totalCost: number;
}

export default function FeeResultCard({
  hasResult,
  amount,
  fee,
  totalCost,
}: FeeResultCardProps) {
  const styles = useThemedStyles(createStyles);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasResult) {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      contentOpacity.setValue(0);
    }
  }, [contentOpacity, hasResult]);

  return (
    <View style={styles.card}>
      {!hasResult ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Enter an amount to see the fee breakdown
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: contentOpacity }}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Transfer amount</Text>
            <GhsText amount={amount} size="sm" />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>MoMo fee</Text>
            <GhsText amount={fee} variant="expense" size="sm" />
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total cost</Text>
            <GhsText amount={totalCost} size="md" />
          </View>
          <Text style={styles.infoText}>
            Fee is calculated from published tier schedules. Actual charges may vary.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    minHeight: 180,
    padding: spacing.lg,
    ...cardShadow,
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 140,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  totalRow: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  totalLabel: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
  },
  infoText: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
});
