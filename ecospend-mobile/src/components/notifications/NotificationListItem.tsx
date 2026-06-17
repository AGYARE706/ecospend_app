import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import {
  formatNotificationTime,
  getNotificationTypeLabel,
  getNotificationVisual,
} from '../../utils/notifications';
import type { AppNotification } from '../../types/notification';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export interface NotificationListItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onDismiss: (id: string) => void;
}

export default function NotificationListItem({
  notification,
  onPress,
  onDismiss,
}: NotificationListItemProps) {
  const visual = getNotificationVisual(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type);
  const timeLabel = formatNotificationTime(notification.createdAt);

  return (
    <Swipeable
      overshootRight={false}
      friction={2}
      rightThreshold={64}
      renderRightActions={() => (
        <DismissAction onDismiss={() => onDismiss(notification.id)} />
      )}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') {
          onDismiss(notification.id);
        }
      }}
    >
      <Pressable
        onPress={() => onPress(notification)}
        style={({ pressed }) => [
          styles.card,
          !notification.read && styles.cardUnread,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={[styles.accentStrip, { backgroundColor: visual.accentColor }]} />

        <View style={styles.contentRow}>
          <View style={[styles.iconWrap, { backgroundColor: visual.iconBackground }]}>
            <Ionicons name={visual.icon} size={20} color={visual.iconColor} />
          </View>

          <View style={styles.textBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.typeLabel}>{typeLabel}</Text>
              {!notification.read ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.time}>{timeLabel}</Text>
          </View>

          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </View>
      </Pressable>
    </Swipeable>
  );
}

function DismissAction({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Pressable
      onPress={onDismiss}
      style={({ pressed }) => [styles.dismissAction, pressed && styles.dismissActionPressed]}
    >
      <Ionicons name="trash-outline" size={20} color={colors.white} />
      <Text style={styles.dismissText}>Dismiss</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...cardShadow,
  },
  cardUnread: {
    backgroundColor: '#FAFCFA',
    borderColor: `${colors.primary}22`,
  },
  cardPressed: {
    opacity: 0.94,
  },
  accentStrip: {
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 44,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: 2,
  },
  typeLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  time: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  dismissAction: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.card,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    width: 92,
  },
  dismissActionPressed: {
    opacity: 0.9,
  },
  dismissText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
});
