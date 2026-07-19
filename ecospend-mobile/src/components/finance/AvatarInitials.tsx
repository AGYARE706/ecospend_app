import { Image, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * name — full name used to derive initials (fallback when no photo)
 * photoUrl — data URI or remote URL; when present, renders the photo
 * instead of initials
 */
export interface AvatarInitialsProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function AvatarInitials({ name, photoUrl, size = 44 }: AvatarInitialsProps) {
  const styles = useThemedStyles(createStyles);
  const dimension = { height: size, width: size, borderRadius: size / 2 };

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.photo, dimension]}
        accessibilityLabel={`${name}'s profile photo`}
      />
    );
  }

  return (
    <View style={[styles.container, dimension]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  photo: {
    backgroundColor: colors.chipBg,
  },
  initials: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
