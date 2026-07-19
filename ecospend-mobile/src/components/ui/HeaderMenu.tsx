import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import {
  navigateToHelpSupport,
  navigateToSecurity,
} from '../../navigation/navigationRef';
import {
  fontSize,
  fontWeight,
  radius,
  shadowLg,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { HEADER_PILL_HEIGHT } from './headerConstants';
import { Icon } from './icons';
import type { IconName } from './icons';

export interface HeaderMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function HeaderMenu({ visible, onClose }: HeaderMenuProps) {
  const insets = useSafeAreaInsets();
  const { colors, mode, setMode } = useTheme();
  const { signOut } = useAuth();
  const styles = useThemedStyles(createStyles);

  const cardTop = insets.top + spacing.xs + HEADER_PILL_HEIGHT + spacing.xs;

  const go = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu">
        <View style={[styles.card, { top: cardTop }]}>
          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>Theme</Text>
            <View style={styles.themeToggle}>
              <ThemeOption
                icon="sun"
                selected={mode === 'light'}
                onPress={() => setMode('light')}
              />
              <ThemeOption
                icon="moon"
                selected={mode === 'dark'}
                onPress={() => setMode('dark')}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <MenuRow
            label="Settings"
            icon="shield-checkmark-outline"
            onPress={() => go(navigateToSecurity)}
          />
          <MenuRow
            label="Help & Support"
            icon="help-circle-outline"
            onPress={() => go(navigateToHelpSupport)}
          />
          <MenuRow
            label="Sign Out"
            icon="log-out-outline"
            destructive
            isLast
            onPress={() => go(signOut)}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

function ThemeOption({
  icon,
  selected,
  onPress,
}: {
  icon: IconName;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.themeOption,
        selected && styles.themeOptionSelected,
        pressed && !selected && styles.themeOptionPressed,
      ]}
    >
      <Icon name={icon} size={16} color={selected ? colors.primary : colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
}

function MenuRow({
  label,
  icon,
  onPress,
  isLast,
  destructive,
}: {
  label: string;
  icon: IconName | (string & {});
  onPress: () => void;
  isLast?: boolean;
  destructive?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isLast && styles.rowLast,
        pressed && styles.rowPressed,
      ]}
    >
      <Icon name={icon} size={18} color={destructive ? colors.error : colors.textDark} strokeWidth={1.8} />
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.lg,
      borderWidth: 1,
      minWidth: 220,
      paddingVertical: spacing.xs,
      position: 'absolute',
      right: spacing.sm,
      ...shadowLg,
    },
    themeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    themeLabel: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    themeToggle: {
      backgroundColor: colors.chipBg,
      borderRadius: radius.full,
      flexDirection: 'row',
      gap: 2,
      padding: 2,
    },
    themeOption: {
      alignItems: 'center',
      borderRadius: radius.full,
      height: 28,
      justifyContent: 'center',
      width: 28,
    },
    themeOptionSelected: {
      backgroundColor: colors.primaryBackground,
    },
    themeOptionPressed: {
      opacity: 0.7,
    },
    divider: {
      backgroundColor: colors.divider,
      height: 1,
      marginVertical: spacing.xs,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    rowLast: {
      marginBottom: 0,
    },
    rowPressed: {
      backgroundColor: colors.chipBg,
    },
    rowLabel: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    rowLabelDestructive: {
      color: colors.error,
    },
  });
