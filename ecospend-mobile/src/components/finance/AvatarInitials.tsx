import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * name — full name used to derive initials
 */
export interface AvatarInitialsProps {
  name: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function AvatarInitials({ name }: AvatarInitialsProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.initials}>{getInitials(name)}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  initials: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
