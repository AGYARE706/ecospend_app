import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * background — screen background color variant ('white' or 'page')
 * scrollable — wraps children in a ScrollView when true
 * keyboardAvoiding — adds KeyboardAvoidingView for form screens
 * padded — applies horizontal/vertical padding to scroll content when true
 * children — screen content to render inside the wrapper
 */
export interface ScreenWrapperProps {
  background?: 'white' | 'page';
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  padded?: boolean;
  /** Safe-area edges to reserve. Omit 'bottom' for screens that sit above the floating tab bar — it already reserves that inset. */
  edges?: Edge[];
  children: ReactNode;
}

export default function ScreenWrapper({
  background = 'page',
  scrollable = false,
  keyboardAvoiding = false,
  padded = true,
  edges = ['top', 'right', 'bottom', 'left'],
  children,
}: ScreenWrapperProps) {
  const styles = useThemedStyles(createStyles);
  const scrollView = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        padded ? styles.paddedContent : styles.unpaddedContent,
      ]}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : null;

  const content = scrollable ? (
    scrollView
  ) : (
    <View style={[styles.flex, padded ? styles.paddedContent : styles.unpaddedContent]}>
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  const containerStyle =
    background === 'white' ? styles.containerWhite : styles.containerPage;

  return (
    <SafeAreaView style={[styles.container, containerStyle]} edges={edges}>
      {wrappedContent}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  containerWhite: {
    backgroundColor: colors.cardBackground,
  },
  containerPage: {
    backgroundColor: colors.pageBackground,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  paddedContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  // `padded={false}` means the screen manages its own padding entirely —
  // this must stay empty. It previously still carried paddingVertical,
  // which silently added a fixed 24px of solid-background dead space to
  // the bottom of every screen using it, sitting right above the tab bar.
  unpaddedContent: {},
});
