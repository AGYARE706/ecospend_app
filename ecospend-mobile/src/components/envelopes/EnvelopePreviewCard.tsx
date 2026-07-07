import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { Envelope } from '../../types';
import {
  getEnvelopePercent,
  getEnvelopeStatus,
  getRemainingBudget,
  getStatusColor,
  getStatusLabel,
} from '../../utils/envelopes';
import EnvelopeProgressBar from './EnvelopeProgressBar';

/**
 * Mini envelope preview card used in the add envelope bottom sheet.
 */
export interface EnvelopePreviewCardProps {
  category: string;
  emoji: string;
  monthlyLimit: number;
}

export default function EnvelopePreviewCard({
  category,
  emoji,
  monthlyLimit,
}: EnvelopePreviewCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const previewEnvelope: Envelope = {
    id: 'preview',
    category: 'Other',
    emoji,
    monthlyLimit,
    currentSpend: 0,
    month: 1,
    year: 2026,
    color: 'primaryBackground',
  };

  const percent = getEnvelopePercent(previewEnvelope);
  const status = getEnvelopeStatus(previewEnvelope);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.category}>{category}</Text>
          <View style={[styles.statusPill, { backgroundColor: getStatusColor(status, colors) }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.limitLabel}>
        Monthly limit: GHS {monthlyLimit.toFixed(2)}
      </Text>

      <EnvelopeProgressBar percent={percent} status={status} />

      <Text style={styles.remainingText}>
        GHS {getRemainingBudget(previewEnvelope).toFixed(2)} remaining
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.pageBackground,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  emojiCircle: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  emoji: {
    fontSize: fontSize.lg,
  },
  headerText: {
    flex: 1,
  },
  category: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  limitLabel: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  remainingText: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
});
