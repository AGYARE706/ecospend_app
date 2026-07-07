import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import { Icon } from '../../components/ui/icons';
import { GOAL_CATEGORIES } from '../../constants/categories';
import type { GoalsStackParamList } from '../../navigation/types';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

type EditGoalRouteProp = RouteProp<GoalsStackParamList, 'EditGoal'>;

interface EditGoalFormState {
    name: string;
    targetAmount: string;
    currentSaved: string;
    targetDeadline: string;
    category: string;
}

export default function EditGoalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
    const { params } = useRoute<EditGoalRouteProp>();
    const navigation = useNavigation();

    const [form, setForm] = useState<EditGoalFormState>({
        name: 'New Home Fund',
        targetAmount: '150000',
        currentSaved: '45000',
        targetDeadline: '2026-12-31',
        category: 'home',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof EditGoalFormState, string>>>({});

    const selectedCategory = GOAL_CATEGORIES[form.category] ?? GOAL_CATEGORIES.other;

    const targetAmountValue = Number(form.targetAmount) || 0;
    const currentSavedValue = Number(form.currentSaved) || 0;
    const remainingAmount = Math.max(targetAmountValue - currentSavedValue, 0);
    const weeklySavingsNeed = targetAmountValue > 0 ? Math.round(remainingAmount / 52) : 0;

    const estimateLabel = useMemo(() => {
        if (!form.targetDeadline) {
            return 'Set a deadline to see the projection';
        }

        return 'Progress is updated from your saved amount and deadline';
    }, [form.targetDeadline]);

    const handleChange = (field: keyof EditGoalFormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const nextErrors: Partial<Record<keyof EditGoalFormState, string>> = {};

        if (!form.name.trim()) nextErrors.name = 'Goal name is required.';
        if (!form.targetAmount || Number(form.targetAmount) <= 0) {
            nextErrors.targetAmount = 'Enter a valid target amount.';
        }
        if (!form.currentSaved || Number(form.currentSaved) < 0) {
            nextErrors.currentSaved = 'Enter a valid saved amount.';
        }
        if (!form.targetDeadline) nextErrors.targetDeadline = 'Choose a target deadline.';
        if (!form.category) nextErrors.category = 'Choose a category.';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) {
            return;
        }

        navigation.goBack();
    };

    const handleDelete = () => {
        navigation.goBack();
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
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerTextWrap}>
                    <Text style={[typography.label, styles.headerEyebrow]}>Goals</Text>
                    <Text style={[typography.h3, styles.headerTitle]}>Edit Goal</Text>
                </View>

                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="bell" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.heroSection}>
                <Card variant="default" padding="lg" style={styles.heroCard}>
                    <View style={styles.heroIllustration}>
                        <View style={styles.heroRingOuter}>
                            <View style={styles.heroRingInner}>
                                <View style={styles.heroCenter}>
                                    <Icon name="flag" size={28} color={colors.primary} />
                                </View>
                            </View>
                        </View>
                    </View>
                    <Text style={[typography.h2, styles.heroTitle]}>Update Your Goal</Text>
                    <Text style={[typography.body, styles.heroSubtitle]}>
                        Adjust your targets and stay on track for your updated plan.
                    </Text>
                </Card>
            </View>

            <View style={styles.section}>
                <Card variant="default" padding="lg" style={styles.formCard}>
                    <Text style={[typography.h3, styles.sectionTitle]}>Goal Details</Text>

                    <View style={styles.fieldGroup}>
                        <AppInput
                            label="Goal Name"
                            value={form.name}
                            onChangeText={(text) => handleChange('name', text)}
                            placeholder="e.g., Emergency Fund"
                            error={errors.name}
                        />

                        <AppInput
                            label="Target Amount (GHS)"
                            value={form.targetAmount}
                            onChangeText={(text) => handleChange('targetAmount', text)}
                            placeholder="150000"
                            keyboardType="number-pad"
                            error={errors.targetAmount}
                        />

                        <AppInput
                            label="Current Saved (GHS)"
                            value={form.currentSaved}
                            onChangeText={(text) => handleChange('currentSaved', text)}
                            placeholder="45000"
                            keyboardType="number-pad"
                            error={errors.currentSaved}
                        />

                        <View>
                            <Text style={styles.inputLabel}>Target Deadline</Text>
                            <TextInput
                                value={form.targetDeadline}
                                onChangeText={(text) => handleChange('targetDeadline', text)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textLight}
                                style={styles.textField}
                            />
                            {errors.targetDeadline ? (
                                <Text style={styles.errorText}>{errors.targetDeadline}</Text>
                            ) : null}
                        </View>

                        <View>
                            <Text style={styles.inputLabel}>Category</Text>
                            {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryRow}
                            >
                                {Object.entries(GOAL_CATEGORIES).map(([categoryId, category]) => {
                                    const active = form.category === categoryId;

                                    return (
                                        <TouchableOpacity
                                            key={categoryId}
                                            onPress={() => handleChange('category', categoryId)}
                                            style={[styles.categoryChip, active && styles.categoryChipActive]}
                                        >
                                            <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>
                                                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                            </View>
                                            <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                                                {category.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                </Card>
            </View>

            <View style={styles.section}>
                <Card variant="insight" padding="lg" style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Icon name="bar-chart" size={20} color={colors.primary} />
                        <Text style={[typography.h3, styles.summaryTitle]}>Impact Summary</Text>
                    </View>

                    <View style={styles.summaryRows}>
                        <View style={styles.summaryRow}>
                            <Text style={[typography.bodySm, styles.summaryLabel]} numberOfLines={1}>Current Estimate</Text>
                            <Text style={[typography.label, styles.summaryValue]} numberOfLines={1}>Dec 2026</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[typography.bodySm, styles.summaryLabel]} numberOfLines={1}>Updated Estimate</Text>
                            <Text style={[typography.label, styles.summaryValueEmphasis]} numberOfLines={1}>Nov 2026</Text>
                        </View>
                    </View>

                    <View style={styles.savingsNeedCard}>
                        <View style={styles.savingsNeedLabelWrap}>
                            <Icon name="cash" size={18} color={colors.primary} />
                            <Text style={[typography.label, styles.savingsNeedLabel]} numberOfLines={1}>Weekly Savings Needs</Text>
                        </View>
                        <Text style={[typography.label, styles.savingsNeedValue]} numberOfLines={1}>+ GHS {weeklySavingsNeed}</Text>
                    </View>

                    <Text style={[typography.caption, styles.summaryCaption]}>{estimateLabel}</Text>

                    <View style={styles.summaryMetaRow}>
                        <View style={styles.metaPill}>
                            <Text style={styles.metaLabel} numberOfLines={1}>Category</Text>
                            <Text style={styles.metaValue} numberOfLines={1}>{selectedCategory.label}</Text>
                        </View>
                        <View style={styles.metaPill}>
                            <Text style={styles.metaLabel} numberOfLines={1}>Remaining</Text>
                            <Text style={styles.metaValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>GHS {remainingAmount.toLocaleString()}</Text>
                        </View>
                    </View>
                </Card>
            </View>

            <View style={styles.section}>
                <AppButton
                    title="Save Changes"
                    onPress={handleSave}
                    icon="save"
                    variant="primary"
                    size="lg"
                    fullWidth
                    style={styles.primaryButton}
                />

                <AppButton
                    title="Delete Goal"
                    onPress={handleDelete}
                    icon="trash"
                    variant="destructive"
                    size="lg"
                    fullWidth
                />
            </View>

            <View style={styles.bottomSpacer} />
            <Text style={styles.hiddenRouteLabel}>Goal ID: {params.goalId}</Text>
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
    headerTextWrap: {
        alignItems: 'center',
        flex: 1,
    },
    headerEyebrow: {
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    headerTitle: {
        color: colors.textPrimary,
        textAlign: 'center',
    },
    heroSection: {
        marginBottom: spacing.lg,
    },
    heroCard: {
        alignItems: 'center',
    },
    heroIllustration: {
        marginBottom: spacing.lg,
    },
    heroRingOuter: {
        alignItems: 'center',
        backgroundColor: colors.primaryBackground,
        borderColor: colors.primaryBackground,
        borderRadius: 999,
        borderWidth: 10,
        height: 154,
        justifyContent: 'center',
        width: 154,
    },
    heroRingInner: {
        alignItems: 'center',
        borderColor: colors.primary,
        borderRadius: 999,
        borderWidth: 2,
        height: 110,
        justifyContent: 'center',
        width: 110,
    },
    heroCenter: {
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderColor: colors.cardBorder,
        borderRadius: 999,
        borderWidth: 1,
        height: 72,
        justifyContent: 'center',
        width: 72,
    },
    heroTitle: {
        color: colors.textPrimary,
        marginBottom: spacing.smd,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: colors.textSecondary,
        textAlign: 'center',
    },
    section: {
        marginBottom: spacing.lg,
    },
    formCard: {
        gap: spacing.lg,
    },
    sectionTitle: {
        color: colors.textPrimary,
        marginBottom: spacing.smd,
    },
    fieldGroup: {
        gap: spacing.lg,
    },
    inputLabel: {
        color: colors.textDark,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    textField: {
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        borderRadius: radius.input,
        borderWidth: 1.5,
        color: colors.textDark,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        minHeight: 54,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginTop: spacing.xs,
    },
    categoryRow: {
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    categoryChip: {
        alignItems: 'center',
        borderRadius: radius.card,
        gap: spacing.xs,
        paddingHorizontal: spacing.smd,
        paddingVertical: spacing.sm,
    },
    categoryChipActive: {
        backgroundColor: colors.primaryBackground,
    },
    categoryIconWrap: {
        alignItems: 'center',
        backgroundColor: colors.chipBg,
        borderRadius: radius.full,
        height: 52,
        justifyContent: 'center',
        width: 52,
    },
    categoryIconWrapActive: {
        backgroundColor: colors.primary,
    },
    categoryEmoji: {
        fontSize: 24,
    },
    categoryLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        textAlign: 'center',
    },
    categoryLabelActive: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    summaryCard: {
        gap: spacing.md,
    },
    summaryHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    summaryTitle: {
        color: colors.textPrimary,
    },
    summaryRows: {
        gap: spacing.sm,
    },
    summaryRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'space-between',
    },
    summaryLabel: {
        color: colors.textSecondary,
        flexShrink: 1,
    },
    summaryValue: {
        color: colors.textPrimary,
        flexShrink: 0,
    },
    summaryValueEmphasis: {
        color: colors.primary,
    },
    savingsNeedCard: {
        alignItems: 'center',
        backgroundColor: colors.primaryBackground,
        borderRadius: radius.card,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    savingsNeedLabelWrap: {
        alignItems: 'center',
        flexDirection: 'row',
        flexShrink: 1,
        gap: spacing.xs,
    },
    savingsNeedLabel: {
        color: colors.primary,
    },
    savingsNeedValue: {
        color: colors.primary,
    },
    summaryCaption: {
        color: colors.textSecondary,
    },
    summaryMetaRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    metaPill: {
        backgroundColor: colors.chipBg,
        borderRadius: radius.card,
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    metaLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
    },
    metaValue: {
        color: colors.textPrimary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    primaryButton: {
        marginBottom: spacing.sm,
    },
    bottomSpacer: {
        height: spacing.lg,
    },
    hiddenRouteLabel: {
        color: colors.textLight,
        fontSize: 1,
        height: 1,
        opacity: 0,
    },
});