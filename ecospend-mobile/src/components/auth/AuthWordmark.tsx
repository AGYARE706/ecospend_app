import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

export default function AuthWordmark() {
  const styles = useThemedStyles(createStyles);
  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.wordmark }, 'EcoSpend'),
    React.createElement(Text, { style: styles.leaf }, '🌿')
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  wordmark: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  leaf: {
    fontSize: fontSize.lg,
    marginLeft: spacing.xs,
  },
});
