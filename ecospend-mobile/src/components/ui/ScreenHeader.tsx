import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '../../theme';
import IconButton from './IconButton';

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
            <IconButton
              icon="calculator"
              variant="soft"
              onPress={onCalculatorPress}
              accessibilityLabel="Calculator"
            />
          ) : null}
          {onNotificationPress ? (
            <IconButton
              icon="bell"
              variant="soft"
              onPress={onNotificationPress}
              accessibilityLabel="Notifications"
            />
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
    paddingTop: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textDark,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
