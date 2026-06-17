import { useEffect, useRef } from 'react';
import {
  Animated,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  PRIVACY_POLICY_TEXT,
  TERMS_OF_SERVICE_TEXT,
  type FaqItem,
  type SupportLinkItem,
  useHelpSupport,
} from '../../hooks/useHelpSupport';
import type { ProfileStackParamList } from '../../navigation/types';
import {
  cardShadow,
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  spacing,
} from '../../theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HelpSupportNavProp = StackNavigationProp<
  ProfileStackParamList,
  'HelpSupport'
>;

export default function HelpSupportScreen() {
  const navigation = useNavigation<HelpSupportNavProp>();
  const {
    faqItems,
    supportLinks,
    expandedFaqId,
    showReportSheet,
    showPrivacySheet,
    showTermsSheet,
    issueSubject,
    issueDescription,
    issueErrors,
    isSubmittingIssue,
    issueSuccessMessage,
    setIssueSubject,
    setIssueDescription,
    toggleFaq,
    handleSupportLinkPress,
    closeReportSheet,
    closePrivacySheet,
    closeTermsSheet,
    handleSubmitIssue,
    dismissIssueSuccess,
    supportEmail,
  } = useHelpSupport();

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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSub}>Answers, contact, and legal info</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <HeroCard supportEmail={supportEmail} />

          {issueSuccessMessage ? (
            <Pressable
              onPress={dismissIssueSuccess}
              style={styles.successBanner}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.successBannerText}>{issueSuccessMessage}</Text>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}

          <SectionLabel title="Frequently Asked Questions" icon="help-circle-outline" />

          <View style={styles.faqCard}>
            {faqItems.map((item, index) => (
              <View key={item.id}>
                <FaqAccordionItem
                  item={item}
                  expanded={expandedFaqId === item.id}
                  onToggle={() => toggleFaq(item.id)}
                />
                {index < faqItems.length - 1 ? <View style={styles.rowDivider} /> : null}
              </View>
            ))}
          </View>

          <SectionLabel title="Get Help" icon="chatbubbles-outline" />

          <View style={styles.linksCard}>
            {supportLinks.map((link, index) => (
              <View key={link.id}>
                <SupportLinkRow
                  link={link}
                  onPress={() => handleSupportLinkPress(link.action)}
                />
                {index < supportLinks.length - 1 ? <View style={styles.rowDivider} /> : null}
              </View>
            ))}
          </View>

          <Text style={styles.footerHint}>
            Support hours: Mon–Fri, 8:00 AM – 6:00 PM GMT. We aim to reply within 1 business
            day.
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <ReportIssueSheet
        visible={showReportSheet}
        subject={issueSubject}
        description={issueDescription}
        errors={issueErrors}
        loading={isSubmittingIssue}
        onChangeSubject={setIssueSubject}
        onChangeDescription={setIssueDescription}
        onClose={closeReportSheet}
        onSubmit={handleSubmitIssue}
      />

      <LegalDocumentSheet
        visible={showPrivacySheet}
        title="Privacy Policy"
        content={PRIVACY_POLICY_TEXT}
        onClose={closePrivacySheet}
      />

      <LegalDocumentSheet
        visible={showTermsSheet}
        title="Terms of Service"
        content={TERMS_OF_SERVICE_TEXT}
        onClose={closeTermsSheet}
      />
    </ScreenWrapper>
  );
}

function HeroCard({ supportEmail }: { supportEmail: string }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.heroGlow} />
      <View style={styles.heroTopRow}>
        <View style={styles.heroIconRing}>
          <Ionicons name="headset-outline" size={22} color={colors.white} />
        </View>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroEyebrow}>We're here to help</Text>
          <Text style={styles.heroTitle}>Need assistance?</Text>
        </View>
      </View>
      <Text style={styles.heroSubtitle}>
        Browse FAQs below or reach our support team at {supportEmail}.
      </Text>
    </LinearGradient>
  );
}

function FaqAccordionItem({
  item,
  expanded,
  onToggle,
}: {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const rotation = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const chevronRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.faqItem}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.faqQuestionRow,
          expanded && styles.faqQuestionRowExpanded,
          pressed && styles.faqQuestionRowPressed,
        ]}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Ionicons name="chevron-down" size={18} color={colors.primary} />
        </Animated.View>
      </Pressable>

      {expanded ? (
        <View style={styles.faqAnswerWrap}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SupportLinkRow({
  link,
  onPress,
}: {
  link: SupportLinkItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
    >
      <View style={[styles.linkIcon, { backgroundColor: link.iconBackground }]}>
        <Ionicons name={link.icon} size={18} color={link.iconColor} />
      </View>
      <View style={styles.linkTextBlock}>
        <Text style={styles.linkTitle}>{link.title}</Text>
        <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </Pressable>
  );
}

function ReportIssueSheet({
  visible,
  subject,
  description,
  errors,
  loading,
  onChangeSubject,
  onChangeDescription,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  subject: string;
  description: string;
  errors: { subject?: string; description?: string };
  loading: boolean;
  onChangeSubject: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Report Issue</Text>
          <Text style={styles.sheetSubtitle}>
            Describe what went wrong and we will help you resolve it.
          </Text>

          <AppInput
            label="Subject"
            value={subject}
            onChangeText={onChangeSubject}
            placeholder="Brief summary of the issue"
            error={errors.subject}
          />
          <AppInput
            label="Description"
            value={description}
            onChangeText={onChangeDescription}
            placeholder="Steps to reproduce, expected vs actual behavior"
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          <AppButton title="Submit Report" loading={loading} onPress={onSubmit} />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function LegalDocumentSheet({
  visible,
  title,
  content,
  onClose,
}: {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheetLarge}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.legalText}>{content}</Text>
          </ScrollView>

          <AppButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.sectionIconBadge}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={styles.sectionLabelText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  heroCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  heroGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 100,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 100,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  heroIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 44,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroEyebrow: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  heroSubtitle: {
    color: colors.white,
    fontSize: fontSize.sm,
    lineHeight: 20,
    opacity: 0.9,
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderColor: `${colors.primary}33`,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  successBannerText: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSize.sm,
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
  faqCard: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...cardShadow,
  },
  faqItem: {
    overflow: 'hidden',
  },
  faqQuestionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  faqQuestionRowExpanded: {
    backgroundColor: colors.primaryBackground,
  },
  faqQuestionRowPressed: {
    opacity: 0.92,
  },
  faqQuestion: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: 22,
  },
  faqAnswerWrap: {
    backgroundColor: colors.pageBackground,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  faqAnswer: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 21,
  },
  linksCard: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    ...cardShadow,
  },
  linkRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  linkRowPressed: {
    backgroundColor: colors.chipBg,
  },
  linkIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  linkTextBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  linkTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  linkSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  rowDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginHorizontal: spacing.sm,
  },
  footerHint: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  sheetLarge: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '82%',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  sheetTitle: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sheetCancel: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  sheetCancelPressed: {
    opacity: 0.6,
  },
  sheetCancelText: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  legalText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
