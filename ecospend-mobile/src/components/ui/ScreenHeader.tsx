import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

/**
 * Consistent screen header with title, optional subtitle, and optional right slot.
 */
export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({
  title,
  subtitle,
  right,
  style,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
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
    alignSelf: 'center',
  },
});
