import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import { fontSize, fontWeight, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

export default function AuthWordmark() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.wordmark }, 'EcoSpend'),
    React.createElement(
      View,
      { style: styles.leaf },
      React.createElement(Icon, {
        name: 'leaf',
        size: fontSize.lg,
        color: colors.primary,
        strokeWidth: 1.9,
      }),
    ),
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
    marginLeft: spacing.xs,
  },
});
