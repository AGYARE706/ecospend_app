import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  fontSize,
  fontWeight,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * Section heading with optional leading icon medallion and a right-aligned
 * action link.
 */
export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: IconName | (string & {});
}

export default function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  icon,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon ? (
          <Icon name={icon} size={17} color={colors.textMuted} strokeWidth={1.9} />
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          hitSlop={spacing.sm}
        >
          <Text style={styles.action}>{actionLabel}</Text>
          <Icon name="chevron-right" size={15} color={colors.primary} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.smd,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.subheading,
    color: colors.textDark,
    fontWeight: fontWeight.bold,
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  actionPressed: {
    opacity: 0.6,
  },
  action: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
