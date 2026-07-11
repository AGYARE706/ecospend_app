import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { spacing, typography, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import IconButton from './IconButton';

/**
 * Consistent screen header with title, optional subtitle, back/close, and right slot.
 */
export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBackPress?: () => void;
  backVariant?: 'back' | 'close';
  onNotificationPress?: () => void;
  onCalculatorPress?: () => void;
  style?: ViewStyle;
}

export default function ScreenHeader({
  title,
  subtitle,
  right,
  onBackPress,
  backVariant = 'back',
  onNotificationPress,
  onCalculatorPress,
  style,
}: ScreenHeaderProps) {
  const styles = useThemedStyles(createStyles);
  const showActions =
    onNotificationPress !== undefined || onCalculatorPress !== undefined || right;

  return (
    <View style={[styles.container, style]}>
      {onBackPress ? (
        <IconButton
          icon={backVariant === 'close' ? 'x' : 'chevron-left'}
          variant="soft"
          onPress={onBackPress}
          accessibilityLabel={backVariant === 'close' ? 'Close' : 'Go back'}
          style={styles.backButton}
        />
      ) : null}

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
      ) : onBackPress ? (
        <View style={styles.rightSpacer} />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    backButton: {
      marginRight: spacing.sm,
      marginTop: spacing.xs,
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
    rightSpacer: {
      width: 40,
    },
  });
