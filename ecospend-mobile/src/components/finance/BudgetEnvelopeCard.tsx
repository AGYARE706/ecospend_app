import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import Card from '../ui/Card';
import GhsText from '../ui/GhsText';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import type { BudgetEnvelope } from '../../types';

/**
 * Compact horizontal budget envelope card for dashboard carousel.
 */
export interface BudgetEnvelopeCardProps {
  envelope: BudgetEnvelope;
}

function getStatusColor(ratio: number): string {
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
  const fillAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const ratio = envelope.limit > 0 ? envelope.spent / envelope.limit : 0;
  const progressPercent = Math.min(ratio * 100, 100);
  const fillColor = getStatusColor(ratio);

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
    <Card style={styles.card}>
      <Text style={styles.emoji}>{envelope.emoji}</Text>
      <Text style={styles.name}>{envelope.category}</Text>

      <View style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View
          style={[styles.fill, { width: fillAnim, backgroundColor: fillColor }]}
        />
      </View>

      <View style={styles.amountRow}>
        <GhsText amount={envelope.spent} size="sm" />
        <Text style={styles.ofText}> of </Text>
        <GhsText amount={envelope.limit} size="sm" style={styles.limitAmount} />
      </View>

      <Text style={styles.percentLabel}>{Math.round(progressPercent)}% used</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: spacing.md,
    width: 168,
  },
  emoji: {
    fontSize: fontSize.xl,
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
  ofText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  limitAmount: {
    color: colors.textMuted,
  },
  percentLabel: {
    color: colors.textLight,
    fontSize: fontSize.xs,
  },
});
