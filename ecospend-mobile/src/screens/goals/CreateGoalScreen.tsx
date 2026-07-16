import { useNavigation } from '@react-navigation/native';
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

import Card from '../../components/ui/Card';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import CalendarPicker from '../../components/ui/CalendarPicker';
import { Icon } from '../../components/ui/icons';
import { useGoals } from '../../context/GoalsContext';
import {
  spacing,
  fontSize,
  fontWeight,
  radius,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { GOAL_CATEGORIES } from '../../constants/categories';

interface GoalFormData {
  category: string;
  title: string;
  targetAmount: string;
  targetDate: string;
}

export default function CreateGoalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { addGoal, isSavingGoal } = useGoals();
  const [formData, setFormData] = useState<GoalFormData>({
    category: '',
    title: '',
    targetAmount: '',
    targetDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Suggested equal contributions to hit the target by the deadline —
  // recomputed live as the amount or date changes.
  const suggestion = useMemo(() => {
    const amount = parseFloat(formData.targetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.targetDate)) {
      return null;
    }
    const [y, m, d] = formData.targetDate.split('-').map(Number);
    const deadline = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
    if (days < 7) {
      return null;
    }

    const weeks = Math.max(1, Math.floor(days / 7));
    const months = Math.floor(days / 30);
    return {
      dateLabel: deadline.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      weekly: amount / weeks,
      weeks,
      monthly: months >= 1 ? amount / months : null,
      months,
    };
  }, [formData.targetAmount, formData.targetDate]);

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, category: categoryId }));
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Please select a goal category';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }
    if (!formData.targetDate) {
      newErrors.targetDate = 'Please select a target date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGoal = async () => {
    if (!validateForm()) {
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    // The calendar always writes YYYY-MM-DD and never allows past dates.
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(formData.targetDate)
      ? formData.targetDate
      : null;

    await addGoal({
      name: formData.title.trim(),
      targetAmount,
      deadline,
    });
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Goal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={[typography.h2, styles.heroTitle]}>Plan Your Financial Future</Text>
        <Text style={[typography.body, styles.heroSubtitle]}>
          Set a savings goal and watch your progress grow
        </Text>
      </View>

      {/* Form Card */}
      <Card variant="default" padding="lg" style={styles.formCard}>
        {/* Category Selector */}
        <View style={styles.formSection}>
          <Text style={[typography.label, styles.sectionLabel]}>Goal Category</Text>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {Object.entries(GOAL_CATEGORIES).map(([categoryId, category]) => (
              <TouchableOpacity
                key={categoryId}
                style={[
                  styles.categoryButton,
                  formData.category === categoryId &&
                    styles.categoryButtonActive,
                ]}
                onPress={() => handleCategorySelect(categoryId)}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    {
                      backgroundColor:
                        formData.category === categoryId
                          ? colors.primary
                          : colors.chipBg,
                    },
                  ]}
                >
                  <Icon
                    name={category.icon}
                    size={20}
                    color={
                      formData.category === categoryId
                        ? colors.onPrimary
                        : colors.textSecondary
                    }
                    strokeWidth={1.9}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    formData.category === categoryId &&
                      styles.categoryLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Goal Title Input */}
        <View style={styles.formSection}>
          <AppInput
            label="Goal Title"
            value={formData.title}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, title: text }));
              setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g., Emergency Fund, Vacation"
            error={errors.title}
          />
        </View>

        {/* Target Amount Input */}
        <View style={styles.formSection}>
          <AppInput
            label="Target Amount"
            value={formData.targetAmount}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, targetAmount: text }));
              setErrors((prev) => ({ ...prev, targetAmount: '' }));
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.targetAmount}
          />
        </View>

        {/* Target Date — calendar picker, past dates disabled */}
        <View style={[styles.formSection, styles.formSectionLast]}>
          <Text style={[typography.label, styles.sectionLabel]}>Target Date</Text>
          <TouchableOpacity
            style={[styles.dateField, errors.targetDate ? styles.dateFieldError : null]}
            onPress={() => setShowCalendar((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel="Choose target date"
          >
            <Icon name="calendar" size={18} color={colors.textMuted} strokeWidth={1.9} />
            <Text
              style={[
                styles.dateFieldText,
                !formData.targetDate && styles.dateFieldPlaceholder,
              ]}
            >
              {suggestion?.dateLabel ??
                (formData.targetDate || 'Tap to pick a date')}
            </Text>
            <Icon
              name={showCalendar ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textMuted}
              strokeWidth={2}
            />
          </TouchableOpacity>
          {errors.targetDate ? (
            <Text style={styles.errorText}>{errors.targetDate}</Text>
          ) : null}
          {showCalendar ? (
            <View style={styles.calendarWrap}>
              <CalendarPicker
                value={formData.targetDate || null}
                onSelect={(isoDate) => {
                  setFormData((prev) => ({ ...prev, targetDate: isoDate }));
                  setErrors((prev) => ({ ...prev, targetDate: '' }));
                  setShowCalendar(false);
                }}
              />
            </View>
          ) : null}
        </View>
      </Card>

      {/* Suggested contribution plan (or a generic tip until inputs are in) */}
      <Card variant="primary" padding="sm" style={styles.recommendationCard}>
        <View style={styles.recommendationContent}>
          <View style={styles.recommendationIcon}>
            <Icon name="bulb" size={18} color={colors.onPrimary} strokeWidth={1.9} />
          </View>
          <View style={styles.recommendationText}>
            {suggestion ? (
              <>
                <Text style={[typography.label, styles.recommendationTitle]}>
                  Suggested contributions
                </Text>
                <Text style={[typography.bodySm, styles.recommendationSubtitle]}>
                  To reach GHS {(parseFloat(formData.targetAmount) || 0).toLocaleString()} by{' '}
                  {suggestion.dateLabel}, save about GHS {suggestion.weekly.toFixed(2)} weekly
                  ({suggestion.weeks} weeks)
                  {suggestion.monthly !== null
                    ? ` or GHS ${suggestion.monthly.toFixed(2)} monthly (${suggestion.months} month${suggestion.months === 1 ? '' : 's'})`
                    : ''}
                  .
                </Text>
              </>
            ) : (
              <>
                <Text style={[typography.label, styles.recommendationTitle]}>Pro Tip</Text>
                <Text style={[typography.bodySm, styles.recommendationSubtitle]}>
                  Set an amount and a target date to see the weekly and monthly
                  savings needed to get there.
                </Text>
              </>
            )}
          </View>
        </View>
      </Card>

      {/* Create Button */}
      <AppButton
        title="Create Goal"
        onPress={() => {
          void handleCreateGoal();
        }}
        loading={isSavingGoal}
        variant="primary"
        size="lg"
        fullWidth
        style={styles.createButton}
      />

      {/* Bottom spacing for scrolling comfort */}
      <View style={styles.bottomSpacer} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  formCard: {
    marginBottom: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.md,
  },
  formSectionLast: {
    marginBottom: 0,
  },
  sectionLabel: {
    color: colors.textPrimary,
    marginBottom: spacing.smd,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginBottom: spacing.smd,
  },
  categoryScroll: {
    marginHorizontal: -spacing.smd,
  },
  categoryContainer: {
    paddingHorizontal: spacing.smd,
    gap: spacing.smd,
  },
  categoryButton: {
    alignItems: 'center',
    gap: spacing.smd,
    maxWidth: 80,
  },
  categoryButtonActive: {
    opacity: 1,
  },
  categoryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateFieldError: {
    borderColor: colors.error,
  },
  dateFieldText: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  dateFieldPlaceholder: {
    color: colors.textLight,
    fontWeight: fontWeight.regular,
  },
  calendarWrap: {
    marginTop: spacing.sm,
  },
  recommendationCard: {
    marginBottom: spacing.lg,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  recommendationIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 34,
    justifyContent: 'center',
    marginTop: spacing.xs,
    width: 34,
  },
  recommendationText: {
    flex: 1,
    gap: spacing.smd,
  },
  recommendationTitle: {
    color: colors.onPrimary,
  },
  recommendationSubtitle: {
    color: colors.onPrimary,
    lineHeight: 20,
  },
  createButton: {
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
});
