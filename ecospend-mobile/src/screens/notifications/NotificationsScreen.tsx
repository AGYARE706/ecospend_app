import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import NotificationListItem from '../../components/notifications/NotificationListItem';
import EmptyState from '../../components/ui/EmptyState';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useNotifications } from '../../hooks/useNotifications';
import type { AppStackParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from '../../theme';

type NotificationsNavProp = StackNavigationProp<
  AppStackParamList,
  'Notifications'
>;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsNavProp>();
  const {
    sections,
    unreadCount,
    isEmpty,
    dismissNotification,
    markAllRead,
    handleNotificationPress,
  } = useNotifications(navigation);

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
                : 'You are all caught up'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 ? (
              <Pressable
                onPress={markAllRead}
                style={({ pressed }) => [
                  styles.markReadBtn,
                  pressed && styles.markReadBtnPressed,
                ]}
              >
                <Text style={styles.markReadText}>Mark all read</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
              hitSlop={spacing.sm}
            >
              <Ionicons name="close" size={22} color={colors.textDark} />
            </Pressable>
          </View>
        </View>

        {unreadCount > 0 ? (
          <View style={styles.summaryBanner}>
            <Ionicons name="notifications" size={16} color={colors.primary} />
            <Text style={styles.summaryBannerText}>
              Swipe left on any notification to dismiss it.
            </Text>
          </View>
        ) : null}

        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              emoji="🔔"
              title="No notifications"
              subtitle="Alerts about budgets, goals, vaults, and insights will appear here."
            />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotificationListItem
                notification={item}
                onPress={handleNotificationPress}
                onDismiss={dismissNotification}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <SectionHeader title={title} />
            )}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  handleBar: {
    alignSelf: 'center',
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 4,
    marginTop: spacing.sm,
    width: 40,
  },
  header: {
    alignItems: 'flex-start',
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  markReadBtn: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  markReadBtnPressed: {
    opacity: 0.85,
  },
  markReadText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  closeBtn: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  summaryBanner: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderBottomColor: `${colors.primary}22`,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  summaryBannerText: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    backgroundColor: colors.pageBackground,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
