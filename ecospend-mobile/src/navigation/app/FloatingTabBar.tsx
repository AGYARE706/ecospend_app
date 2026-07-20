import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  fontSize,
  fontWeight,
  pressScale,
  radius,
  shadowLg,
  spacing,
  useTheme,
} from '../../theme';

export default function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8);

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: bottomInset + spacing.xxs,
          backgroundColor: colors.pageBackground,
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.primaryLight,
          },
          shadowLg,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Navigate to the tab WITHOUT replaying route.params. Deep-link
              // helpers (navigateToLearn, navigateToSecurity, Dashboard "See
              // all", …) reach nested screens via navigate('MainTabs', { screen,
              // params: { screen } }), which leaves that nested directive stored
              // on the tab route's params. Passing it back here re-fired it, so
              // e.g. tapping Profile jumped to Financial Lessons. popToTopOnBlur
              // already resets the tab's stack on blur, so a bare switch lands
              // on the tab's root screen.
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused ? colors.primary : colors.textMuted;
          const labelColor = isFocused ? colors.primary : colors.textMuted;
          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: iconColor,
            size: 20,
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tab,
                isFocused && [
                  styles.activeTab,
                  { backgroundColor: colors.primaryBackground },
                ],
                pressed && styles.pressed,
              ]}
            >
              {icon}
              <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isFocused ? colors.primary : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  bar: {
    borderRadius: radius.xxl,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 58,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  activeTab: {
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  dot: {
    borderRadius: 2,
    height: 4,
    marginTop: 2,
    width: 4,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: pressScale.icon }],
  },
});
