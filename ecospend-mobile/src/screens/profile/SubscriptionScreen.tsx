import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import GhsText from '../../components/ui/GhsText';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  type PlanComparisonRow,
  type SubscriptionBenefit,
  useSubscription,
} from '../../hooks/useSubscription';
import type { ProfileStackParamList } from '../../navigation/types';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type SubscriptionNavProp = StackNavigationProp<
  ProfileStackParamList,
  'Subscription'
>;

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<SubscriptionNavProp>();
  const {
    isPlus,
    isUpgrading,
    benefits,
    comparisonRows,
    planTitle,
    planSubtitle,
    annualPrice,
    monthlyEquivalent,
    handleUpgrade,
  } = useSubscription();

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Subscription</Text>
            <Text style={styles.headerSub}>EcoSpend Plus membership</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>Premium savings tools</Text>
          </View>

          <Text style={styles.heroTitle}>Unlock EcoSpend Plus</Text>
          <Text style={styles.heroSubtitle}>
            Save smarter with vaults, group savings, and advanced insights built for
            Ghana.
          </Text>

          <CurrentPlanCard
            isPlus={isPlus}
            planTitle={planTitle}
            planSubtitle={planSubtitle}
          />

          <SectionLabel title="Premium Benefits" icon="star-outline" />
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </View>

          <SectionLabel title="Pricing" icon="pricetag-outline" />
          <PricingCard
            annualPrice={annualPrice}
            monthlyEquivalent={monthlyEquivalent}
            isPlus={isPlus}
          />

          <SectionLabel title="Compare Plans" icon="git-compare-outline" />
          <ComparisonTable rows={comparisonRows} />

          <Text style={styles.disclaimer}>
            Subscription renews annually. Cancel anytime from your account settings.
            Payment processing is simulated in this demo.
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          {isPlus ? (
            <View style={styles.activePlanBanner}>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              <View style={styles.activePlanTextBlock}>
                <Text style={styles.activePlanTitle}>You're on EcoSpend Plus</Text>
                <Text style={styles.activePlanSub}>
                  All premium benefits are active on your account.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.footerPriceRow}>
                <GhsText amount={annualPrice} size="md" />
                <Text style={styles.footerPriceSuffix}>/year</Text>
                <Text style={styles.footerPriceHint}>
                  · GHS {monthlyEquivalent}/mo
                </Text>
              </View>
              <AppButton
                title="Upgrade to Plus"
                icon="arrow-up-circle-outline"
                loading={isUpgrading}
                onPress={handleUpgrade}
              />
            </>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

function CurrentPlanCard({
  isPlus,
  planTitle,
  planSubtitle,
}: {
  isPlus: boolean;
  planTitle: string;
  planSubtitle: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  if (isPlus) {
    return (
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planCardGradient}
      >
        <View style={styles.planGlow} />
        <View style={styles.planTopRow}>
          <View style={styles.planIconRing}>
            <Ionicons name="star" size={20} color={colors.white} />
          </View>
          <View style={styles.planTextBlock}>
            <Text style={styles.planEyebrowLight}>Current Plan</Text>
            <Text style={styles.planTitleLight}>{planTitle}</Text>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>Active</Text>
          </View>
        </View>
        <Text style={styles.planBodyLight}>{planSubtitle}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.planCardFree}>
      <View style={styles.planTopRow}>
        <View style={[styles.planIconRing, styles.planIconRingFree]}>
          <Ionicons name="leaf-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.planTextBlock}>
          <Text style={styles.planEyebrow}>Current Plan</Text>
          <Text style={styles.planTitle}>{planTitle}</Text>
        </View>
      </View>
      <Text style={styles.planBody}>{planSubtitle}</Text>
    </View>
  );
}

function BenefitCard({ benefit }: { benefit: SubscriptionBenefit }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.benefitCard}>
      <View style={[styles.benefitIcon, { backgroundColor: benefit.iconBackground }]}>
        <Ionicons name={benefit.icon} size={20} color={benefit.iconColor} />
      </View>
      <Text style={styles.benefitTitle}>{benefit.title}</Text>
      <Text style={styles.benefitDescription}>{benefit.description}</Text>
    </View>
  );
}

function PricingCard({
  annualPrice,
  monthlyEquivalent,
  isPlus,
}: {
  annualPrice: number;
  monthlyEquivalent: string;
  isPlus: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.pricingCard}>
      <LinearGradient
        colors={[colors.primaryBackground, colors.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pricingGradient}
      >
        <View style={styles.pricingTop}>
          <View>
            <Text style={styles.pricingLabel}>Annual membership</Text>
            <View style={styles.pricingAmountRow}>
              <GhsText amount={annualPrice} size="hero" style={styles.pricingAmount} />
              <Text style={styles.pricingPeriod}>/year</Text>
            </View>
            <Text style={styles.pricingHint}>
              Just GHS {monthlyEquivalent} per month, billed once yearly
            </Text>
          </View>
          <View style={styles.pricingBadge}>
            <Text style={styles.pricingBadgeText}>Best value</Text>
          </View>
        </View>

        <View style={styles.pricingDivider} />

        <View style={styles.pricingPerks}>
          <PricingPerk icon="checkmark-circle" text="All premium vault features" />
          <PricingPerk icon="checkmark-circle" text="Group vaults & voting" />
          <PricingPerk icon="checkmark-circle" text="Priority alerts & analytics" />
        </View>

        {isPlus ? (
          <View style={styles.pricingIncludedRow}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.pricingIncludedText}>Included in your plan</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

function PricingPerk({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.pricingPerkRow}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.pricingPerkText}>{text}</Text>
    </View>
  );
}

function ComparisonTable({ rows }: { rows: PlanComparisonRow[] }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.comparisonCard}>
      <View style={styles.comparisonHeader}>
        <Text style={[styles.comparisonHeaderCell, styles.comparisonFeatureCol]}>
          Feature
        </Text>
        <Text style={styles.comparisonHeaderCell}>Free</Text>
        <View style={styles.comparisonPlusHeader}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={[styles.comparisonHeaderCell, styles.comparisonPlusLabel]}>
            Plus
          </Text>
        </View>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.feature}
          style={[
            styles.comparisonRow,
            index < rows.length - 1 && styles.comparisonRowBorder,
          ]}
        >
          <Text style={[styles.comparisonFeature, styles.comparisonFeatureCol]}>
            {row.feature}
          </Text>
          <ComparisonCell
            included={row.freeIncluded}
            label={row.freeLabel}
            muted
          />
          <ComparisonCell included={row.plusIncluded} label={row.plusLabel} highlight />
        </View>
      ))}
    </View>
  );
}

function ComparisonCell({
  included,
  label,
  highlight = false,
  muted = false,
}: {
  included: boolean;
  label: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  if (label === 'Basic' || label === 'Full') {
    return (
      <View style={styles.comparisonCell}>
        <Text
          style={[
            styles.comparisonLabel,
            highlight && styles.comparisonLabelHighlight,
            muted && styles.comparisonLabelMuted,
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }

  if (!included || label === '—') {
    return (
      <View style={styles.comparisonCell}>
        <Ionicons name="close-circle-outline" size={18} color={colors.textLight} />
      </View>
    );
  }

  return (
    <View style={styles.comparisonCell}>
      <Ionicons
        name="checkmark-circle"
        size={18}
        color={highlight ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.sectionIconBadge}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={styles.sectionLabelText}>{title}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  heroTitle: {
    color: colors.textDark,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  planCardGradient: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  planGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
  },
  planCardFree: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.heroCard,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    ...cardShadow,
  },
  planTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  planIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 44,
  },
  planIconRingFree: {
    backgroundColor: colors.primaryBackground,
  },
  planTextBlock: {
    flex: 1,
  },
  planEyebrow: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  planEyebrowLight: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  planTitle: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  planTitleLight: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  planBody: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  planBodyLight: {
    color: colors.white,
    fontSize: fontSize.sm,
    lineHeight: 20,
    opacity: 0.9,
  },
  activePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activePillText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  sectionLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionLabelText: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  benefitCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    width: '48.5%',
    ...shadowSm,
  },
  benefitIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 40,
  },
  benefitTitle: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 17,
  },
  pricingCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadowMd,
  },
  pricingGradient: {
    borderColor: colors.borderSubtle,
    borderRadius: radius.heroCard,
    borderWidth: 1,
    padding: spacing.lg,
  },
  pricingTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  pricingAmountRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  pricingAmount: {
    lineHeight: 44,
  },
  pricingPeriod: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    marginBottom: 6,
  },
  pricingHint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  pricingBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pricingBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  pricingDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.md,
  },
  pricingPerks: {
    gap: spacing.sm,
  },
  pricingPerkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pricingPerkText: {
    color: colors.textDark,
    fontSize: fontSize.sm,
  },
  pricingIncludedRow: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pricingIncludedText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  comparisonCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...cardShadow,
  },
  comparisonHeader: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  comparisonHeaderCell: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  comparisonPlusHeader: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  comparisonPlusLabel: {
    color: colors.primary,
  },
  comparisonFeatureCol: {
    flex: 1.6,
    textAlign: 'left',
  },
  comparisonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  comparisonRowBorder: {
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  comparisonFeature: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  comparisonCell: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  comparisonLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  comparisonLabelHighlight: {
    color: colors.primary,
  },
  comparisonLabelMuted: {
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  disclaimer: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 140,
  },
  footer: {
    backgroundColor: colors.cardBackground,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  footerPriceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  footerPriceSuffix: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  footerPriceHint: {
    color: colors.textLight,
    fontSize: fontSize.sm,
  },
  activePlanBanner: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  activePlanTextBlock: {
    flex: 1,
  },
  activePlanTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  activePlanSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
