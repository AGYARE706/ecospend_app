import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAbout } from '../../hooks/useAbout';
import {
  PRIVACY_POLICY_TEXT,
  TERMS_OF_SERVICE_TEXT,
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

type AboutNavProp = StackNavigationProp<ProfileStackParamList, 'About'>;

export default function AboutScreen() {
  const navigation = useNavigation<AboutNavProp>();
  const {
    buildLabel,
    description,
    mission,
    showPrivacySheet,
    showTermsSheet,
    openPrivacySheet,
    closePrivacySheet,
    openTermsSheet,
    closeTermsSheet,
  } = useAbout();

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
            <Text style={styles.headerTitle}>About</Text>
            <Text style={styles.headerSub}>EcoSpend app information</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logoSection}>
            <View style={styles.logoRing}>
              <LinearGradient
                colors={[colors.primaryDark, colors.primary, '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Ionicons name="leaf" size={40} color={colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.brandName}>EcoSpend</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>{buildLabel}</Text>
            </View>
          </View>

          <View style={styles.contentCard}>
            <ContentBlock
              icon="information-circle-outline"
              title="About the app"
              body={description}
            />
            <View style={styles.contentDivider} />
            <ContentBlock
              icon="heart-outline"
              title="Our mission"
              body={mission}
            />
          </View>

          <Text style={styles.linksLabel}>Legal</Text>
          <View style={styles.linksCard}>
            <LegalLinkRow
              title="Privacy Policy"
              icon="document-text-outline"
              iconColor={colors.primary}
              iconBackground={colors.primaryBackground}
              onPress={openPrivacySheet}
            />
            <View style={styles.rowDivider} />
            <LegalLinkRow
              title="Terms of Service"
              icon="reader-outline"
              iconColor="#6A1B9A"
              iconBackground="#F3E5F5"
              onPress={openTermsSheet}
              isLast
            />
          </View>

          <Text style={styles.footerText}>
            Made with care for smarter saving in Ghana.
          </Text>
          <Text style={styles.copyright}>© {new Date().getFullYear()} EcoSpend</Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

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

function ContentBlock({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.contentBlock}>
      <View style={styles.contentHeader}>
        <View style={styles.contentIconBadge}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={styles.contentTitle}>{title}</Text>
      </View>
      <Text style={styles.contentBody}>{body}</Text>
    </View>
  );
}

function LegalLinkRow({
  title,
  icon,
  iconColor,
  iconBackground,
  onPress,
  isLast = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        !isLast && styles.linkRowSpacing,
        pressed && styles.linkRowPressed,
      ]}
    >
      <View style={[styles.linkIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.linkTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </Pressable>
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
    paddingTop: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoRing: {
    marginBottom: spacing.md,
    ...shadowMd,
  },
  logoGradient: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  brandName: {
    color: colors.textDark,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  versionBadge: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  versionText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    ...cardShadow,
  },
  contentBlock: {},
  contentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contentIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  contentTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  contentBody: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  contentDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.lg,
  },
  linksLabel: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  linksCard: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
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
  linkRowSpacing: {},
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
  linkTitle: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  rowDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginHorizontal: spacing.sm,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  copyright: {
    color: colors.textLight,
    fontSize: fontSize.xs,
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
    marginBottom: spacing.md,
  },
  legalText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
