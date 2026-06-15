import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing, subtleShadow } from '../../theme';
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
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === 'active' ? styles.activeTab : styles.inactiveTab]}
        onPress={() => onTabChange('active')}
      >
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.full,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.white,
    ...subtleShadow,
  },
  inactiveTab: {},
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  activeText: {
    color: colors.textDark,
  },
  inactiveText: {
    color: colors.textMuted,
  },
});
