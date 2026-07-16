import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../ui/AppButton';
import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import { getCategoryVisual } from '../../constants/categories';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
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
 * Full budget envelope card with status, progress, alerts, and edit action.
 */
export interface EnvelopeCardProps {
  envelope: Envelope;
  index: number;
  onEdit: (envelope: Envelope) => void;
}

export default function EnvelopeCard({ envelope, index, onEdit }: EnvelopeCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const percent = getEnvelopePercent(envelope);
  const status = getEnvelopeStatus(envelope);
  const remaining = getRemainingBudget(envelope);
  const statusColor = getStatusColor(status, colors);
  const showEditButton = status === 'healthy' || status === 'atRisk';
  const showAlert = status === 'critical' || status === 'exhausted';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const alertMessage =
    status === 'exhausted'
      ? 'Budget exhausted — spending paused for this category'
      : `Only GHS ${remaining.toFixed(2)} left — ${percent}% used`;

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.emojiCircle,
            { backgroundColor: colors[getCategoryVisual(envelope.category).background] },
          ]}
        >
          <Icon
            name={getCategoryVisual(envelope.category).icon}
            size={20}
            color={colors[getCategoryVisual(envelope.category).tint]}
            strokeWidth={1.9}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.category}>{envelope.category}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>
        <Text style={styles.percentText}>{percent}%</Text>
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Spent</Text>
          <GhsText amount={envelope.currentSpend} size="sm" />
        </View>
        <View style={styles.limitBlock}>
          <Text style={styles.amountLabel}>Limit</Text>
          <GhsText amount={envelope.monthlyLimit} size="sm" />
        </View>
      </View>

      <EnvelopeProgressBar percent={percent} status={status} />

      <View style={styles.remainingPill}>
        <Ionicons name="wallet-outline" size={fontSize.sm} color={colors.primary} />
        <Text style={styles.remainingText}>
          GHS {remaining.toFixed(2)} remaining
        </Text>
      </View>

      {showAlert ? (
        <View style={styles.alertBanner}>
          <Ionicons name="warning-outline" size={fontSize.sm} color={colors.error} />
          <Text style={styles.alertText}>{alertMessage}</Text>
        </View>
      ) : null}

      {showEditButton ? (
        <AppButton
          title="+ Add to Budget"
          variant="outline"
          onPress={() => onEdit(envelope)}
          style={styles.editButton}
        />
      ) : null}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  emojiCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 42,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 42,
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
  percentText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  amountLabel: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  limitBlock: {
    alignItems: 'flex-end',
  },
  remainingPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  remainingText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  alertBanner: {
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  alertText: {
    color: colors.error,
    flex: 1,
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  editButton: {
    marginTop: spacing.md,
  },
});
