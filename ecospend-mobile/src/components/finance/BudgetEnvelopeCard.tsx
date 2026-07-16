import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import { getCategoryVisual } from '../../constants/categories';
import {
  radius,
  shadowSm,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { BudgetEnvelope } from '../../types';

/**
 * Compact horizontal budget envelope card for dashboard carousel.
 */
export interface BudgetEnvelopeCardProps {
  envelope: BudgetEnvelope;
}

function getStatusColor(ratio: number, colors: ThemeColors): string {
  if (ratio >= 1) {
    return colors.exhausted;
  }
  if (ratio > 0.8) {
    return colors.critical;
  }
  if (ratio >= 0.6) {
    return colors.atRisk;
  }
  return colors.healthy;
}

export default function BudgetEnvelopeCard({ envelope }: BudgetEnvelopeCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const ratio = envelope.limit > 0 ? envelope.spent / envelope.limit : 0;
  const progressPercent = Math.min(ratio * 100, 100);
  const fillColor = getStatusColor(ratio, colors);
  const visual = getCategoryVisual(envelope.category);

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    Animated.spring(fillAnim, {
      toValue: (progressPercent / 100) * trackWidth,
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start();
  }, [fillAnim, progressPercent, trackWidth]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.accentStrip, { backgroundColor: fillColor }]} />

      <View style={[styles.iconCircle, { backgroundColor: colors[visual.background] }]}>
        <Icon name={visual.icon} size={20} color={colors[visual.tint]} strokeWidth={1.9} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {envelope.category}
      </Text>

      <View style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View
          style={[styles.fill, { width: fillAnim, backgroundColor: fillColor }]}
        />
      </View>

      <View style={styles.amountRow}>
        <GhsText amount={envelope.spent} size="sm" numberOfLines={1} style={styles.spentAmount} />
        <Text style={styles.ofText}> of </Text>
        <GhsText amount={envelope.limit} size="sm" numberOfLines={1} style={styles.limitAmount} />
      </View>

      <Text style={[styles.percentLabel, { color: fillColor }]}>
        {Math.round(progressPercent)}% used
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing.smd,
    overflow: 'hidden',
    padding: spacing.md,
    width: 160,
    ...shadowSm,
  },
  accentStrip: {
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 38,
  },
  name: {
    ...typography.label,
    color: colors.textDark,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  track: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 6,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.full,
    height: 6,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  spentAmount: {
    flexShrink: 1,
  },
  ofText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  limitAmount: {
    color: colors.textMuted,
    flexShrink: 1,
  },
  percentLabel: {
    ...typography.caption,
    fontWeight: typography.label.fontWeight,
  },
});
