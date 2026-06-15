import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing, subtleShadow } from '../../theme';
import type { ProviderType } from '../../types';

/**
 * Single MoMo provider card with initials circle, selected state, and press animation.
 */
export interface ProviderCardProps {
  provider: ProviderType;
  initials: string;
  circleColor: string;
  selected: boolean;
  onSelect: (provider: ProviderType) => void;
}

export default function ProviderCard({
  provider,
  initials,
  circleColor,
  selected,
  onSelect,
}: ProviderCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onSelect(provider)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.card,
          selected ? styles.cardSelected : styles.cardDefault,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.circle, { backgroundColor: circleColor }]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text
          style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}
          numberOfLines={2}
        >
          {provider}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    borderRadius: radius.providerCard,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  cardDefault: {
    backgroundColor: colors.white,
    ...subtleShadow,
  },
  cardSelected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  circle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 40,
  },
  initials: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  labelDefault: {
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primary,
  },
});
