import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
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
  const [formData, setFormData] = useState<GoalFormData>({
    category: '',
    title: '',
    targetAmount: '',
    targetDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleCreateGoal = () => {
    if (validateForm()) {
      // TODO: Call the useSavingsGoals hook or API to create goal
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
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
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
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

        {/* Target Date Input */}
        <View style={[styles.formSection, styles.formSectionLast]}>
          <AppInput
            label="Target Date"
            value={formData.targetDate}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, targetDate: text }));
              setErrors((prev) => ({ ...prev, targetDate: '' }));
            }}
            placeholder="MM/DD/YYYY"
            error={errors.targetDate}
          />
        </View>
      </Card>

      {/* Recommendation Card */}
      <Card variant="primary" padding="md" style={styles.recommendationCard}>
        <View style={styles.recommendationContent}>
          <Text style={styles.recommendationEmoji}>💡</Text>
          <View style={styles.recommendationText}>
            <Text style={[typography.label, styles.recommendationTitle]}>Pro Tip</Text>
            <Text style={[typography.bodySm, styles.recommendationSubtitle]}>
              Break down large goals into monthly targets for better tracking
            </Text>
          </View>
        </View>
      </Card>

      {/* Create Button */}
      <AppButton
        title="Create Goal"
        onPress={handleCreateGoal}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
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
  recommendationCard: {
    marginBottom: spacing.lg,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  recommendationEmoji: {
    fontSize: 24,
    marginTop: spacing.smd,
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
