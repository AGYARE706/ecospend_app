import { ReactNode } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { fontSize, fontWeight, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

export interface CollapsedHeaderBarProps {
  title: string;
  rightActions?: ReactNode;
  /** From useCollapsingHeader's `barStyle` — animated opacity. */
  style?: Animated.WithAnimatedValue<ViewStyle>;
}

/**
 * The slim pinned bar that fades in as a screen's hero header scrolls
 * away. Pair with useCollapsingHeader. Render as a sibling directly
 * ABOVE the screen's ScrollView (same flex:1 parent) — not inside it —
 * so it never itself scrolls. Relies on an ancestor SafeAreaView (top
 * edge) for status-bar clearance; does not add its own inset padding.
 */
export default function CollapsedHeaderBar({ title, rightActions, style }: CollapsedHeaderBarProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Animated.View style={[styles.bar, style]} pointerEvents="box-none">
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {rightActions ? <View style={styles.actions}>{rightActions}</View> : null}
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bar: {
      backgroundColor: colors.cardBackground,
      borderBottomColor: colors.borderSubtle,
      borderBottomWidth: StyleSheet.hairlineWidth,
      left: 0,
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 10,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 32,
    },
    title: {
      color: colors.textDark,
      flex: 1,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
      marginLeft: spacing.sm,
    },
  });
