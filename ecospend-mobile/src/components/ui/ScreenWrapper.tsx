import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

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
  children: ReactNode;
}

export default function ScreenWrapper({
  background = 'page',
  scrollable = false,
  keyboardAvoiding = false,
  padded = true,
  children,
}: ScreenWrapperProps) {
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
    <SafeAreaView style={[styles.container, containerStyle]}>
      {wrappedContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerWhite: {
    backgroundColor: colors.white,
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
  unpaddedContent: {
    paddingVertical: spacing.lg,
  },
});
