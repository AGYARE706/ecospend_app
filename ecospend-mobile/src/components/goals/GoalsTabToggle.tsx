import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import {
  radius,
  spacing,
  subtleShadow,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { GoalsTabMode } from '../../types';

/**
 * Segmented control for switching between active and completed goals.
 */
export interface GoalsTabToggleProps {
  activeTab: GoalsTabMode;
  onTabChange: (tab: GoalsTabMode) => void;
}

export default function GoalsTabToggle({
  activeTab,
  onTabChange,
}: GoalsTabToggleProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === 'active' ? styles.activeTab : styles.inactiveTab]}
        onPress={() => onTabChange('active')}
      >
        <Icon
          name="flag-outline"
          size={16}
          color={activeTab === 'active' ? colors.primary : colors.textMuted}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'active' ? styles.activeText : styles.inactiveText,
          ]}
        >
          My Goals
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tab,
          activeTab === 'completed' ? styles.activeTab : styles.inactiveTab,
        ]}
        onPress={() => onTabChange('completed')}
      >
        <Icon
          name="trophy-outline"
          size={16}
          color={activeTab === 'completed' ? colors.primary : colors.textMuted}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'completed' ? styles.activeText : styles.inactiveText,
          ]}
        >
          Completed
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    padding: spacing.xs,
    ...subtleShadow,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.full,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primaryBackground,
  },
  inactiveTab: {},
  tabText: {
    ...typography.label,
  },
  activeText: {
    color: colors.textDark,
  },
  inactiveText: {
    color: colors.textMuted,
  },
});
