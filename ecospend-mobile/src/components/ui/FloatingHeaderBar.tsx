import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import AvatarInitials from '../finance/AvatarInitials';
import { useAuth } from '../../context/AuthContext';
import { useUnreadNotificationsCount } from '../../hooks/useUnreadNotificationsCount';
import { navigateApp, navigateToProfileTab } from '../../navigation/navigationRef';
import {
  radius,
  shadowLg,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { HEADER_PILL_HEIGHT } from './headerConstants';
import HeaderMenu from './HeaderMenu';
import IconButton from './IconButton';

export default function FloatingHeaderBar() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const unreadNotifications = useUnreadNotificationsCount();
  const styles = useThemedStyles(createStyles);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.outer, { paddingTop: spacing.xs + insets.top }]}>
      <LinearGradient
        colors={[colors.cardBackground, colors.primaryBackground]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bar, { borderColor: colors.primaryLight }, shadowLg]}
      >
        <Pressable
          onPress={navigateToProfileTab}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={spacing.xs}
        >
          <View style={styles.avatarRing}>
            <AvatarInitials name={user?.name ?? ''} photoUrl={user?.photoUrl} size={32} />
          </View>
        </Pressable>

        <View style={styles.brandWrap} pointerEvents="none">
          <Text style={styles.brandText} numberOfLines={1}>
            Save Smarter
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon="bell"
            variant="soft"
            size="sm"
            onPress={() => navigateApp('Notifications')}
            accessibilityLabel="Notifications"
            badgeCount={unreadNotifications}
            style={styles.iconBorder}
          />
          <IconButton
            icon="more-vertical"
            variant="soft"
            size="sm"
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="More options"
            style={styles.iconBorder}
          />
        </View>
      </LinearGradient>

      <HeaderMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    outer: {
      paddingHorizontal: spacing.sm,
    },
    bar: {
      alignItems: 'center',
      borderRadius: radius.xxl,
      borderWidth: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: HEADER_PILL_HEIGHT,
      paddingHorizontal: spacing.md,
    },
    avatarRing: {
      borderColor: colors.primary,
      borderRadius: radius.full,
      borderWidth: 2,
      padding: 2,
    },
    iconBorder: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    brandWrap: {
      alignItems: 'center',
      flex: 1,
    },
    brandText: {
      ...typography.label,
      color: colors.primaryDark,
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
  });
