import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../theme';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultProgressBarProps {
  progress: number;
  accentColor: string;
  theme: VaultThemeColors;
}

export default function VaultProgressBar({
  progress,
  accentColor,
  theme,
}: VaultProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Progress</Text>
        <Text style={[styles.percent, { color: theme.text }]}>{progress}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.progressTrack }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: accentColor,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  percent: {
    ...typography.label,
    fontWeight: '700',
  },
  track: {
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.full,
    height: 8,
  },
});
