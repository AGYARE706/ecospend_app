import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cardShadow, colors, spacing } from '../../theme';

/**
 * Floating action button for primary add actions.
 */
export interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons name="add" size={28} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    bottom: spacing.lg,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    ...cardShadow,
  },
});
