import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/icons';
import InfoTooltip from '../../components/ui/InfoTooltip';
import { useGoals } from '../../context/GoalsContext';
import { useWallet } from '../../context/WalletContext';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { formatMonthYear, getRemainingAmount } from '../../utils/goals';

type AddGoalContributionRouteProp = RouteProp<AppStackParamList, 'AddGoalContribution'>;

export default function AddGoalContributionScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
    const { params } = useRoute<AddGoalContributionRouteProp>();
    const navigation = useNavigation();
    const { getGoalById, contributeToGoal, isContributing } = useGoals();
    const { balance } = useWallet();
    const walletBalance = balance ?? 0;
    const [amount, setAmount] = useState('');

    const goal = getGoalById(params.goalId);

    const quickAmounts = useMemo(() => [20, 50, 100], []);

    if (!goal) {
      return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <EmptyState
            icon="target"
            title="Goal not found"
            subtitle="This goal may have been deleted."
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </SafeAreaView>
      );
    }

    const baseAmount = goal.currentAmount;
    const targetAmount = goal.targetAmount;
    const goalTitle = goal.name;
    const targetDate = goal.deadline ? formatMonthYear(goal.deadline) : 'No deadline';
    const remaining = getRemainingAmount(goal);

    const addedAmount = Number(amount) || 0;
    const newBalance = Math.min(baseAmount + addedAmount, targetAmount);
    const currentProgress = (baseAmount / targetAmount) * 100;
    const addedProgress = Math.min((addedAmount / targetAmount) * 100, 100 - currentProgress);
    const previewPercentage = addedAmount > 0 ? `+${((addedAmount / targetAmount) * 100).toFixed(1)}%` : '+0%';

    const handleChipPress = (value: number) => {
        setAmount((prev) => String(Math.min((Number(prev) || 0) + value, remaining)));
    };

    const effectiveAmount = Math.min(addedAmount, remaining);
    const hasEnoughBalance = effectiveAmount <= walletBalance;
    const exceedsRemaining = addedAmount > remaining && remaining > 0;

    const handleSave = async () => {
        if (effectiveAmount <= 0 || !hasEnoughBalance) {
          return;
        }

        // Real money: the backend debits the wallet and auto-records
        // the expense, so only close the sheet when it succeeds.
        const ok = await contributeToGoal(goal.id, effectiveAmount);
        if (ok) {
          navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            enabled={Platform.OS === 'ios'}
          >
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Icon name="chevron-left" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[typography.h3, styles.headerTitle]}>EcoSpend</Text>
                </View>

                <InfoTooltip
                  title="Contributing to a goal"
                  body="This moves real money — the amount is debited from your EcoSpend wallet immediately and recorded as an expense. Goals have no lock period and no fee, and you can withdraw any amount back to your wallet at any time from the goal's details screen."
                />
            </View>

            <View style={styles.heroSection}>
                <View style={styles.heroOrb}>
                    <Icon name="sparkles" size={24} color={colors.primary} />
                </View>
                <Text style={[typography.h2, styles.heroTitle]}>Keep Growing</Text>
                <Text style={[typography.body, styles.heroSubtitle]}>
                    Every contribution brings you closer.
                </Text>
            </View>

            <View style={styles.section}>
                <Card variant="default" padding="md" style={styles.goalCard}>
                    <View style={styles.goalTopRow}>
                        <View style={styles.goalCopy}>
                            <Text style={[typography.overline, styles.goalEyebrow]} numberOfLines={1}>{goalTitle.toUpperCase()}</Text>
                            <Text style={[typography.h2, styles.goalAmount]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                                GHS {baseAmount.toLocaleString()}{' '}
                                <Text style={styles.goalDivider}>/ GHS {targetAmount.toLocaleString()}</Text>
                            </Text>
                        </View>

                        <View style={styles.progressBadge}>
                            <Text style={styles.progressBadgeText}>{Math.round(currentProgress)}% Complete</Text>
                        </View>
                    </View>

                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBase, { width: `${currentProgress}%` }]} />
                    </View>

                    <View style={styles.goalMetaRow}>
                        <Text style={styles.goalMetaText} numberOfLines={1}>
                            GHS {Math.max(targetAmount - baseAmount, 0).toLocaleString()} remaining
                        </Text>
                        <Text style={[styles.goalMetaText, styles.goalMetaTextRight]} numberOfLines={1}>Target: {targetDate}</Text>
                    </View>
                </Card>
            </View>

            <View style={styles.section}>
                <AppInput
                    label="Contribution Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    leadingIcon="cash"
                    hint={`Paid from your wallet — GHS ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available`}
                    error={
                      effectiveAmount > 0 && !hasEnoughBalance
                        ? 'Amount exceeds your wallet balance — top up first'
                        : undefined
                    }
                />

                {exceedsRemaining ? (
                  <View style={styles.capBanner}>
                    <Icon name="alert-circle" size={16} color={colors.warning} />
                    <Text style={styles.capBannerText}>
                      That's more than this goal needs — we'll only take GHS{' '}
                      {remaining.toFixed(2)} from your wallet and mark the goal complete.
                    </Text>
                  </View>
                ) : null}

                <View style={styles.chipsRow}>
                    {quickAmounts.map((value) => (
                        <TouchableOpacity
                            key={value}
                            style={styles.quickChip}
                            onPress={() => handleChipPress(value)}
                        >
                            <Text style={styles.quickChipText}>+ GHS {value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Card variant="outlined" padding="sm" style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewLabel}>Projection</Text>
                        <Text style={styles.previewPercent}>{previewPercentage}</Text>
                    </View>

                    <View style={styles.previewRow}>
                        <Text style={styles.previewSubLabel} numberOfLines={1}>New Balance</Text>
                        <Text style={[typography.h3, styles.previewBalance]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                            GHS {newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>

                    <View style={styles.previewBarTrack}>
                        <View style={[styles.previewBaseBar, { width: `${currentProgress}%` }]} />
                        <View style={[styles.previewAddedBar, { width: `${addedProgress}%` }]} />
                    </View>
                </Card>
            </View>

            <View style={styles.section}>
                <AppButton
                    title="Contribute from Wallet"
                    onPress={() => {
                      void handleSave();
                    }}
                    loading={isContributing}
                    disabled={effectiveAmount <= 0 || !hasEnoughBalance}
                    icon="arrow-right"
                    variant="primary"
                    size="lg"
                    fullWidth
                />
            </View>

            <Text style={styles.hiddenGoalId}>Goal ID: {params.goalId}</Text>
        </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.pageBackground,
    },
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.pageBackground,
    },
    contentContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    headerLeft: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        borderRadius: radius.button,
        borderWidth: 1,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },
    headerTitle: {
        color: colors.primary,
        fontWeight: fontWeight.bold,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    heroOrb: {
        alignItems: 'center',
        backgroundColor: colors.primaryBackground,
        borderRadius: 999,
        height: 56,
        justifyContent: 'center',
        marginBottom: spacing.smd,
        width: 56,
    },
    heroTitle: {
        color: colors.textPrimary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: colors.textSecondary,
        textAlign: 'center',
    },
    section: {
        marginBottom: spacing.lg,
    },
    goalCard: {
        gap: spacing.md,
        overflow: 'hidden',
    },
    goalTopRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    goalCopy: {
        flex: 1,
    },
    goalEyebrow: {
        color: colors.textLight,
        marginBottom: spacing.xs,
    },
    goalAmount: {
        color: colors.textPrimary,
    },
    goalDivider: {
        color: colors.textLight,
        fontSize: fontSize.md,
        fontWeight: fontWeight.regular,
    },
    progressBadge: {
        backgroundColor: colors.successLight,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    progressBadgeText: {
        color: colors.success,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    progressTrack: {
        backgroundColor: colors.divider,
        borderRadius: radius.full,
        height: 10,
        overflow: 'hidden',
    },
    progressBase: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        height: '100%',
    },
    goalMetaRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'space-between',
    },
    goalMetaText: {
        color: colors.textSecondary,
        flexShrink: 1,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    goalMetaTextRight: {
        textAlign: 'right',
    },
    capBanner: {
        alignItems: 'flex-start',
        backgroundColor: colors.warningLight,
        borderRadius: radius.md,
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
        padding: spacing.sm,
    },
    capBannerText: {
        color: colors.textPrimary,
        flex: 1,
        fontSize: fontSize.xs,
        lineHeight: 18,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    quickChip: {
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        borderRadius: radius.full,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 44,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    quickChipText: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    previewCard: {
        gap: spacing.md,
    },
    previewHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    previewLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    previewPercent: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    previewSubLabel: {
        color: colors.textSecondary,
        flexShrink: 0,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    previewBalance: {
        color: colors.primary,
        flexShrink: 1,
        textAlign: 'right',
    },
    previewBarTrack: {
        backgroundColor: colors.divider,
        borderRadius: radius.full,
        flexDirection: 'row',
        height: 8,
        overflow: 'hidden',
    },
    previewBaseBar: {
        backgroundColor: colors.textLight,
        height: '100%',
    },
    previewAddedBar: {
        backgroundColor: colors.primary,
        height: '100%',
    },
    hiddenGoalId: {
        color: colors.textLight,
        fontSize: 1,
        height: 1,
        opacity: 0,
    },
});
