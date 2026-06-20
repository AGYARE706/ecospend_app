import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

export default function AuthWordmark() {
  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.wordmark }, 'EcoSpend'),
    React.createElement(Text, { style: styles.leaf }, '🌿')
  );
}

const styles = StyleSheet.create({
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
