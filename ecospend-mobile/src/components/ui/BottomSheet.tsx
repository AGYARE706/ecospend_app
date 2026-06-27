import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, duration, easing, radius, shadowLg, spacing, typography } from '../../theme';
import IconButton from './IconButton';

/**
 * A premium slide-up sheet with a scrim, grab handle and optional titled
 * header. Use for contextual actions, filters and confirmations instead of
 * stacking full screens. Mount conditionally and drive with `visible`.
 */
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Hide the top-right close affordance. */
  hideClose?: boolean;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  hideClose = false,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration.base,
          easing: easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration.base,
          easing: easing.standard,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(40);
      opacity.setValue(0);
    }
  }, [visible, translateY, opacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY }], opacity },
          ]}
        >
          <View style={styles.handle} />

          {title ? (
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              {!hideClose ? (
                <IconButton icon="x" variant="ghost" size="sm" onPress={onClose} accessibilityLabel="Close" />
              ) : null}
            </View>
          ) : null}

          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.smd,
    ...shadowLg,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textDark,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  body: {
    width: '100%',
  },
});
