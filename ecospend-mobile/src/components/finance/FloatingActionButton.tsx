import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, shadowLg, spacing } from '../../theme';

/**
 * Floating action button for primary add actions.
 */
export interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Ionicons name="add" size={28} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    bottom: spacing.lg,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    width: 60,
    ...shadowLg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.95 }],
  },
});
