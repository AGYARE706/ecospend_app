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
 * children — screen content to render inside the wrapper
 */
export interface ScreenWrapperProps {
  background?: 'white' | 'page';
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  children: ReactNode;
}

export default function ScreenWrapper({
  background = 'page',
  scrollable = false,
  keyboardAvoiding = false,
  children,
}: ScreenWrapperProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
