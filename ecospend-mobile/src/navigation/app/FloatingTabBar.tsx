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
            borderColor: colors.borderSubtle,
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
              navigation.navigate(route.name, route.params);
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
    borderWidth: 1,
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
  pressed: {
    opacity: 0.88,
    transform: [{ scale: pressScale.icon }],
  },
});
