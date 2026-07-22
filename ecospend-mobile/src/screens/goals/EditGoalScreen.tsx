import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import EmptyState from '../../components/ui/EmptyState';
import GoalIcon from '../../components/ui/GoalIcon';
import { Icon } from '../../components/ui/icons';
import { GOAL_CATEGORIES } from '../../constants/categories';
import { useGoals } from '../../context/GoalsContext';
import { useUnreadNotificationsCount } from '../../hooks/useUnreadNotificationsCount';
import { navigateApp } from '../../navigation/navigationRef';
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
    const { getGoalById, updateGoal, deleteGoal, isSavingGoal } = useGoals();
    const existing = getGoalById(params.goalId);
    const unreadNotifications = useUnreadNotificationsCount();

    const [form, setForm] = useState<EditGoalFormState>({
        name: '',
        targetAmount: '',
        currentSaved: '',
        targetDeadline: '',
        category: 'other',
    });
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
      if (!existing || initialized) {
        return;
      }

      setForm({
        name: existing.name,
        targetAmount: String(existing.targetAmount),
        currentSaved: String(existing.currentAmount),
        targetDeadline: existing.deadline ?? '',
        category: 'other',
      });
      setInitialized(true);
    }, [existing, initialized]);

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
        if (!form.category) nextErrors.category = 'Choose a category.';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate() || !existing) {
            return;
        }

        await updateGoal(existing.id, {
          name: form.name.trim(),
          targetAmount: Number(form.targetAmount),
          deadline: form.targetDeadline.trim() || null,
        });

        navigation.goBack();
    };

    const handleDelete = () => {
        if (!existing) {
          return;
        }

        const hasBalance = existing.currentAmount > 0;
        Alert.alert(
          'Delete this goal?',
          hasBalance
            ? `This goal still holds GHS ${existing.currentAmount.toLocaleString()} — withdraw it back to your wallet first. This can't be undone.`
            : "This can't be undone.",
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                void deleteGoal(existing.id).then((success) => {
                  if (success) {
                    navigation.goBack();
                  }
                });
              },
            },
          ],
        );
    };

    if (!existing) {
      return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <EmptyState
            imageSource={require('../../../assets/goal.png')}
            title="Goal not found"
            subtitle="This goal may have been deleted."
            actionLabel="Go back"
            onAction={() => navigation.goBack()}
          />
        </SafeAreaView>
      );
    }

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

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigateApp('Notifications')}
                    accessibilityRole="button"
                    accessibilityLabel="Notifications"
                >
                    <Icon name="bell" size={20} color={colors.textPrimary} />
                    {unreadNotifications > 0 ? (
                        <View style={[styles.notifBadge, { backgroundColor: colors.error }]}>
                            <Text style={styles.notifBadgeText}>
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </Text>
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>

            <View style={styles.heroSection}>
                <Card variant="default" padding="sm" style={styles.heroCard}>
                    <View style={styles.heroIllustration}>
                        <View style={styles.heroRingOuter}>
                            <View style={styles.heroRingInner}>
                                <View style={styles.heroCenter}>
                                    <GoalIcon size={28} color={colors.primary} />
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

                        <View>
                            <Text style={styles.inputLabel}>Current Saved (GHS)</Text>
                            <View style={styles.readOnlyField}>
                                <Text style={styles.readOnlyFieldValue}>{form.currentSaved}</Text>
                            </View>
                            <Text style={styles.readOnlyFieldHint}>
                                Only changes through Add Money or Withdraw — not editable here.
                            </Text>
                        </View>

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
                                                <Icon
                                                    name={category.icon}
                                                    size={18}
                                                    color={active ? colors.onPrimary : colors.textSecondary}
                                                    strokeWidth={1.9}
                                                />
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
                <Card variant="insight" padding="md" style={styles.summaryCard}>
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
                    onPress={() => {
                      void handleSave();
                    }}
                    loading={isSavingGoal}
                    icon="save"
                    variant="primary"
                    size="lg"
                    fullWidth
                    style={styles.primaryButton}
                />

                <AppButton
                    title="Delete Goal"
                    onPress={() => {
                      void handleDelete();
                    }}
                    loading={isSavingGoal}
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
    notifBadge: {
        alignItems: 'center',
        borderColor: colors.cardBackground,
        borderRadius: radius.full,
        borderWidth: 1.5,
        height: 18,
        justifyContent: 'center',
        minWidth: 18,
        paddingHorizontal: 3,
        position: 'absolute',
        right: -4,
        top: -4,
    },
    notifBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
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
    readOnlyField: {
        backgroundColor: colors.chipBg,
        borderColor: colors.border,
        borderRadius: radius.input,
        borderWidth: 1.5,
        justifyContent: 'center',
        minHeight: 54,
        paddingHorizontal: spacing.md,
    },
    readOnlyFieldValue: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    readOnlyFieldHint: {
        color: colors.textLight,
        fontSize: fontSize.xs,
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