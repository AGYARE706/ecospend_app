import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../../components/ui/icons';
import type { IconName } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import type { ProfileStackParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
} from '../../theme';

type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

type MenuRoute = Exclude<keyof ProfileStackParamList, 'Profile'>;

const menuItems: Array<{
  label: string;
  route: MenuRoute;
  icon: IconName | (string & {});
}> = [
  { label: 'Edit Profile', route: 'EditProfile', icon: 'person-outline' },
  { label: 'Subscription', route: 'Subscription', icon: 'star-outline' },
  { label: 'Security', route: 'Security', icon: 'shield-checkmark-outline' },
  {
    label: 'Notifications',
    route: 'NotificationSettings',
    icon: 'notifications-outline',
  },
  {
    label: 'Badges & Streaks',
    route: 'BadgesAndStreaks',
    icon: 'trophy-outline',
  },
  { label: 'Help & Support', route: 'HelpSupport', icon: 'help-circle-outline' },
  { label: 'About', route: 'About', icon: 'information-circle-outline' },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { signOut } = useAuth();
  const { name, formattedPhone, isPlus, stats } = useProfile();

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <View style={styles.headerCard}>
            <View style={styles.avatarRing}>
              <LinearGradient
                colors={[colors.primaryDark, colors.primary]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
              </LinearGradient>
              <View style={styles.avatarBadge}>
                <Icon name="checkmark" size={12} color={colors.white} />
              </View>
            </View>

            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.phoneRow}>
              <Icon name="call-outline" size={14} color={colors.textMuted} />
              <Text style={styles.phone} numberOfLines={1}>{formattedPhone}</Text>
            </View>
          </View>

          {/* Membership Card */}
          {isPlus ? (
            <LinearGradient
              colors={['#1B5E20', '#2E7D32', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.membershipCard}
            >
              <View style={styles.membershipGlow} />
              <View style={styles.membershipTop}>
                <View style={styles.membershipIconRing}>
                  <Icon name="star" size={18} color={colors.white} />
                </View>
                <View style={styles.membershipTextBlock}>
                  <Text style={styles.membershipLabel}>Membership</Text>
                  <Text style={styles.membershipTitle}>EcoSpend Plus</Text>
                </View>
                <View style={styles.plusPill}>
                  <Text style={styles.plusPillText}>Active</Text>
                </View>
              </View>
              <Text style={styles.membershipBody}>
                You have access to premium vault tools, insights, and priority support.
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.freeCard}>
              <View style={styles.membershipTop}>
                <View style={[styles.membershipIconRing, styles.freeIconRing]}>
                  <Icon name="leaf-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.membershipTextBlock}>
                  <Text style={styles.freeLabel}>Membership</Text>
                  <Text style={styles.freeTitle}>Free Plan</Text>
                </View>
              </View>
              <Text style={styles.freeBody}>
                Upgrade to Plus for advanced vault features, group savings tools, and fee insights.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Subscription')}
                style={({ pressed }) => [
                  styles.upgradeBtn,
                  pressed && styles.upgradeBtnPressed,
                ]}
              >
                <Icon name="arrow-up-circle-outline" size={16} color={colors.white} />
                <Text style={styles.upgradeBtnText}>Upgrade to Plus</Text>
              </Pressable>
            </View>
          )}

          {/* Statistics Section */}
          <SectionLabel title="Your Activity" icon="analytics-outline" />
          <View style={styles.statsCard}>
            <StatItem
              icon="flag-outline"
              iconColor={colors.blue}
              label="Goals Completed"
              value={String(stats.goalsCompleted)}
            />
            <View style={styles.statDivider} />
            <StatItem
              icon="lock-closed-outline"
              iconColor={colors.primary}
              label="Vaults Created"
              value={String(stats.vaultsCreated)}
            />
            <View style={styles.statDivider} />
            <StatItem
              icon="flame-outline"
              iconColor={colors.warning}
              label="Savings Streak"
              value={`${stats.savingsStreak}d`}
            />
          </View>

          {/* Menu Items */}
          <SectionLabel title="Account" icon="settings-outline" />
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <MenuRow
                key={item.route}
                label={item.label}
                icon={item.icon}
                isLast={index === menuItems.length - 1}
                onPress={() => navigation.navigate(item.route)}
              />
            ))}
          </View>

          {/* Logout */}
          <View style={styles.logoutSection}>
            <Pressable
              onPress={signOut}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
            >
              <Icon name="log-out-outline" size={18} color={colors.error} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </Pressable>
            <Text style={styles.logoutHint}>
              You'll be signed out of EcoSpend on this device.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: IconName | (string & {});
}) {
  return (
    <View style={labelStyles.row}>
      <Icon name={icon} size={14} color={colors.primary} />
      <Text style={labelStyles.text}>{title}</Text>
    </View>
  );
}

function StatItem({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: IconName | (string & {});
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={statStyles.item}>
      <View style={[statStyles.iconRing, { backgroundColor: `${iconColor}18` }]}>
        <Icon name={icon} size={16} color={iconColor} />
      </View>
      <Text style={statStyles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={statStyles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function MenuRow({
  label,
  icon,
  isLast,
  onPress,
}: {
  label: string;
  icon: IconName | (string & {});
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        menuStyles.row,
        isLast && menuStyles.rowLast,
        pressed && menuStyles.rowPressed,
      ]}
    >
      <View style={menuStyles.iconRing}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={menuStyles.label}>{label}</Text>
      <Icon name="chevron-forward" size={18} color={colors.textLight} />
    </Pressable>
  );
}

const labelStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  text: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
});

const statStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flex: 1,
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 36,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});

const menuStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: spacing.sm,
  },
  rowPressed: {
    opacity: 0.85,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 36,
  },
  label: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.heroCard,
    borderWidth: 1,
    marginBottom: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    ...shadowMd,
  },
  avatarRing: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 84,
    justifyContent: 'center',
    width: 84,
    ...shadowSm,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  avatarBadge: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 24,
  },
  name: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  phoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  phone: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
  },
  membershipCard: {
    borderRadius: radius.card,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadowMd,
  },
  membershipGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 90,
    position: 'absolute',
    right: -18,
    top: -18,
    width: 90,
  },
  membershipTop: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  membershipIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  membershipTextBlock: {
    flex: 1,
  },
  membershipLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  membershipTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  plusPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  plusPillText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  membershipBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  freeCard: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadowSm,
  },
  freeIconRing: {
    backgroundColor: colors.primaryBackground,
  },
  freeLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  freeTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  freeBody: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  upgradeBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  upgradeBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  upgradeBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  statsCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    ...shadowSm,
  },
  statDivider: {
    backgroundColor: colors.divider,
    height: 56,
    width: 1,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...shadowSm,
  },
  logoutSection: {
    marginTop: spacing.xl,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: `${colors.error}55`,
    borderRadius: radius.button,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
  },
  logoutButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  logoutHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.lg,
  },
});
