import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import { Icon } from '../../components/ui/icons';
import type { AppStackParamList } from '../../navigation/types';
import { colors, fontSize, fontWeight, radius, spacing, typography } from '../../theme';

type AddGoalContributionRouteProp = RouteProp<AppStackParamList, 'AddGoalContribution'>;

export default function AddGoalContributionScreen() {
    const { params } = useRoute<AddGoalContributionRouteProp>();
    const navigation = useNavigation();
    const [amount, setAmount] = useState('');

    const baseAmount = 1250;
    const targetAmount = 5000;
    const goalTitle = 'New Motorcycle';
    const targetDate = 'Dec 2024';

    const quickAmounts = useMemo(() => [20, 50, 100], []);

    const addedAmount = Number(amount) || 0;
    const newBalance = baseAmount + addedAmount;
    const currentProgress = (baseAmount / targetAmount) * 100;
    const addedProgress = Math.min((addedAmount / targetAmount) * 100, 100 - currentProgress);
    const previewPercentage = addedAmount > 0 ? `+${((addedAmount / targetAmount) * 100).toFixed(1)}%` : '+0%';

    const handleChipPress = (value: number) => {
        setAmount((prev) => String((Number(prev) || 0) + value));
    };

    const handleSave = () => {
        navigation.goBack();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Icon name="chevron-left" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[typography.h3, styles.headerTitle]}>EcoSpend</Text>
                </View>

                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="bell" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.heroSection}>
                <View style={styles.heroOrb}>
                    <View style={styles.heroOrbInner}>
                        <Icon name="sparkles" size={30} color={colors.primary} />
                    </View>
                </View>
                <Text style={[typography.h2, styles.heroTitle]}>Keep Growing</Text>
                <Text style={[typography.body, styles.heroSubtitle]}>
                    Every contribution brings you closer.
                </Text>
            </View>

            <View style={styles.section}>
                <Card variant="default" padding="lg" style={styles.goalCard}>
                    <View style={styles.goalTopRow}>
                        <View style={styles.goalCopy}>
                            <Text style={[typography.overline, styles.goalEyebrow]}>{goalTitle.toUpperCase()}</Text>
                            <Text style={[typography.h2, styles.goalAmount]}>
                                GHS {baseAmount.toLocaleString()}{' '}
                                <Text style={styles.goalDivider}>/ GHS {targetAmount.toLocaleString()}</Text>
                            </Text>
                        </View>

                        <View style={styles.progressBadge}>
                            <Text style={styles.progressBadgeText}>25% Complete</Text>
                        </View>
                    </View>

                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBase, { width: `${currentProgress}%` }]} />
                    </View>

                    <View style={styles.goalMetaRow}>
                        <Text style={styles.goalMetaText}>
                            GHS {Math.max(targetAmount - baseAmount, 0).toLocaleString()} remaining
                        </Text>
                        <Text style={styles.goalMetaText}>Target: {targetDate}</Text>
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
                />

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
                <Card variant="outlined" padding="md" style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewLabel}>Projection</Text>
                        <Text style={styles.previewPercent}>{previewPercentage}</Text>
                    </View>

                    <View style={styles.previewRow}>
                        <Text style={styles.previewSubLabel}>New Balance</Text>
                        <Text style={[typography.h3, styles.previewBalance]}>
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
                    title="Save Contribution"
                    onPress={handleSave}
                    icon="arrow-right"
                    variant="primary"
                    size="lg"
                    fullWidth
                />
            </View>

            <Text style={styles.hiddenGoalId}>Goal ID: {params.goalId}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: radius.button,
        borderWidth: 1,
        height: 42,
        justifyContent: 'center',
        width: 42,
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
        height: 160,
        justifyContent: 'center',
        marginBottom: spacing.md,
        width: 160,
    },
    heroOrbInner: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.primaryBackground,
        borderRadius: 999,
        borderWidth: 1,
        height: 96,
        justifyContent: 'center',
        width: 96,
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
        justifyContent: 'space-between',
    },
    goalMetaText: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    quickChip: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderRadius: radius.full,
        borderWidth: 1,
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
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    previewBalance: {
        color: colors.primary,
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
