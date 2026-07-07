import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../ui/icons';
import { palette, radius, shadowBrand, spacing, useTheme } from '../../theme';

/**
 * Floating action button for primary add actions — a gradient pill with a
 * brand-tinted glow that lifts it off the content beneath.
 */
export interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add transaction"
    >
      <LinearGradient
        colors={[palette.green[500], palette.green[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Icon name="plus" size={28} color={colors.onPrimary} strokeWidth={2.4} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.full,
    bottom: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    ...shadowBrand,
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.94 }],
  },
});
