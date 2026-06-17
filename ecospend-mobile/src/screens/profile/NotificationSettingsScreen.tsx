import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  type NotificationPreference,
  useNotificationSettings,
} from '../../hooks/useNotificationSettings';
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

type NotificationSettingsNavProp = StackNavigationProp<
  ProfileStackParamList,
  'NotificationSettings'
>;

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<NotificationSettingsNavProp>();
  const {
    preferences,
    sections,
    enabledCount,
    totalCount,
    statusMessage,
    togglePreference,
    enableAll,
    disableAll,
  } = useNotificationSettings();

  const allEnabled = enabledCount === totalCount;
  const allDisabled = enabledCount === 0;

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
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>Choose what EcoSpend can send you</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SummaryCard
            enabledCount={enabledCount}
            totalCount={totalCount}
            statusMessage={statusMessage}
          />

          <View style={styles.quickActions}>
            <Pressable
              onPress={enableAll}
              disabled={allEnabled}
              style={({ pressed }) => [
                styles.quickActionBtn,
                allEnabled && styles.quickActionBtnDisabled,
                pressed && !allEnabled && styles.quickActionBtnPressed,
              ]}
            >
              <Text
                style={[
                  styles.quickActionText,
                  allEnabled && styles.quickActionTextDisabled,
                ]}
              >
                Enable all
              </Text>
            </Pressable>
            <Pressable
              onPress={disableAll}
              disabled={allDisabled}
              style={({ pressed }) => [
                styles.quickActionBtn,
                allDisabled && styles.quickActionBtnDisabled,
                pressed && !allDisabled && styles.quickActionBtnPressed,
              ]}
            >
              <Text
                style={[
                  styles.quickActionText,
                  allDisabled && styles.quickActionTextDisabled,
                ]}
              >
                Disable all
              </Text>
            </Pressable>
          </View>

          {sections.map((section) => (
            <View key={section.id}>
              <SectionLabel title={section.title} icon={section.icon} />
              <View style={styles.settingsCard}>
                {section.items.map((item, index) => (
                  <View key={item.key}>
                    <ToggleRow
                      item={item}
                      enabled={preferences[item.key]}
                      onToggle={() => togglePreference(item.key)}
                    />
                    {index < section.items.length - 1 ? (
                      <View style={styles.rowDivider} />
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.footerHint}>
            System permissions for push notifications are managed in your device
            settings. In-app alerts still follow the preferences above.
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SummaryCard({
  enabledCount,
  totalCount,
  statusMessage,
}: {
  enabledCount: number;
  totalCount: number;
  statusMessage: string;
}) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.summaryCard}
    >
      <View style={styles.summaryGlow} />
      <View style={styles.summaryTopRow}>
        <View style={styles.summaryIconRing}>
          <Ionicons name="notifications" size={20} color={colors.white} />
        </View>
        <View style={styles.summaryTextBlock}>
          <Text style={styles.summaryEyebrow}>Notification Preferences</Text>
          <Text style={styles.summaryTitle}>
            {enabledCount} of {totalCount} enabled
          </Text>
        </View>
      </View>
      <Text style={styles.summarySubtitle}>{statusMessage}</Text>
    </LinearGradient>
  );
}

function ToggleRow({
  item,
  enabled,
  onToggle,
}: {
  item: NotificationPreference;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={[styles.rowIcon, { backgroundColor: item.iconBackground }]}>
        <Ionicons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <View style={styles.rowTextBlock}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowDescription}>{item.description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.divider, true: `${colors.primary}66` }}
        thumbColor={enabled ? colors.primary : colors.white}
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
  summaryCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  summaryGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 100,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 100,
  },
  summaryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  summaryIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 44,
  },
  summaryTextBlock: {
    flex: 1,
  },
  summaryEyebrow: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  summarySubtitle: {
    color: colors.white,
    fontSize: fontSize.sm,
    lineHeight: 20,
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
    ...cardShadow,
  },
  quickActionBtnDisabled: {
    opacity: 0.5,
  },
  quickActionBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  quickActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  quickActionTextDisabled: {
    color: colors.textMuted,
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
  settingsCard: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.sm,
    ...cardShadow,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginHorizontal: spacing.sm,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  rowTextBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  rowDescription: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 18,
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
});
