import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { useFinance } from '../../context/FinanceContext';
import AppButton from '../ui/AppButton';
import AppInput from '../ui/AppInput';
import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import {
  fontSize,
  fontWeight,
  radius,
  shadowSm,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * The income side of the monthly budget: the user sets one expected
 * fixed income per month, and actual (auto-recorded) income is tracked
 * against it — the counterpart of the spending envelopes below it.
 */
export default function ExpectedIncomeCard() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { incomeTarget, setIncomeTarget, getMonthlySummary } = useFinance();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const received = getMonthlySummary().totalIncome;
  const hasTarget = incomeTarget > 0;
  const percent = hasTarget
    ? Math.min(Math.round((received / incomeTarget) * 100), 100)
    : 0;
  const difference = received - incomeTarget;

  const handleSave = async () => {
    const parsed = parseFloat(draft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Enter an amount of 0 or more');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await setIncomeTarget(parsed);
      setIsEditing(false);
      setDraft('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the expected income'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Expected Income</Text>
          <Text style={styles.subtitle}>
            What you expect to earn this month — received income is tracked
            against it, just like spending against envelopes.
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setIsEditing((current) => !current);
            setDraft(hasTarget ? String(incomeTarget) : '');
            setError(null);
          }}
          style={styles.editButton}
          accessibilityRole="button"
          accessibilityLabel="Edit expected income"
        >
          <Icon
            name={isEditing ? 'x' : hasTarget ? 'edit' : 'plus'}
            size={16}
            color={colors.primary}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>

      {isEditing ? (
        <View style={styles.editBlock}>
          <AppInput
            label="Expected income per month (GHS)"
            value={draft}
            onChangeText={setDraft}
            placeholder="e.g. 3000"
            keyboardType="decimal-pad"
            error={error ?? undefined}
          />
          <AppButton
            title="Save Expected Income"
            size="sm"
            loading={isSaving}
            onPress={() => void handleSave()}
          />
        </View>
      ) : hasTarget ? (
        <>
          <View style={styles.amountRow}>
            <GhsText amount={received} size="lg" compact numberOfLines={1} />
            <Text style={styles.ofText}>
              {' '}/{' '}
            </Text>
            <GhsText
              amount={incomeTarget}
              size="lg"
              compact
              numberOfLines={1}
              style={styles.targetAmount}
            />
            <Text style={styles.percentText}>{percent}%</Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${percent}%`,
                  backgroundColor:
                    difference >= 0 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>

          <Text style={styles.statusLine}>
            {difference >= 0
              ? `Received GHS ${difference.toFixed(2)} more than expected — a good month.`
              : `GHS ${Math.abs(difference).toFixed(2)} still expected this month.`}
          </Text>
        </>
      ) : (
        <Text style={styles.emptyText}>
          No expected income set yet. Tap + to set it and start tracking
          whether each month brings in what you planned.
        </Text>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1,
      marginBottom: spacing.mlg,
      padding: spacing.md,
      ...shadowSm,
    },
    headerRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    headerText: {
      flex: 1,
    },
    title: {
      ...typography.label,
      color: colors.textDark,
      marginBottom: 2,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textMuted,
    },
    editButton: {
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    editBlock: {
      gap: spacing.sm,
    },
    amountRow: {
      alignItems: 'baseline',
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    ofText: {
      ...typography.bodySm,
      color: colors.textMuted,
    },
    targetAmount: {
      color: colors.textMuted,
    },
    percentText: {
      ...typography.label,
      color: colors.textMuted,
      flex: 1,
      textAlign: 'right',
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
      height: '100%',
    },
    statusLine: {
      ...typography.caption,
      color: colors.textMuted,
    },
    emptyText: {
      ...typography.bodySm,
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
    },
  });
