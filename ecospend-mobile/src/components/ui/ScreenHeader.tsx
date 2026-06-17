import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

/**
 * Consistent screen header with title, optional subtitle, and optional right slot.
 */
export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onNotificationPress?: () => void;
  onCalculatorPress?: () => void;
  style?: ViewStyle;
}

export default function ScreenHeader({
  title,
  subtitle,
  right,
  onNotificationPress,
  onCalculatorPress,
  style,
}: ScreenHeaderProps) {
  const showActions =
    onNotificationPress !== undefined || onCalculatorPress !== undefined || right;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showActions ? (
        <View style={styles.right}>
          {onCalculatorPress ? (
            <Pressable onPress={onCalculatorPress} style={styles.iconButton}>
              <Ionicons
                name="calculator-outline"
                size={fontSize.xl}
                color={colors.textDark}
              />
            </Pressable>
          ) : null}
          {onNotificationPress ? (
            <Pressable onPress={onNotificationPress} style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={fontSize.xl}
                color={colors.textDark}
              />
            </Pressable>
          ) : null}
          {right}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  right: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});
