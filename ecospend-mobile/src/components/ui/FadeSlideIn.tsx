import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

export interface FadeSlideInProps {
  children: ReactNode;
  /** Stagger offset in ms — pass index * ~70 for a cascading section reveal. */
  delay?: number;
  style?: ViewStyle;
}

/**
 * A gentle fade + rise-in for content that appears once per mount (screen
 * sections on first load, list rows on first render) — not meant to replay
 * on every re-render, so keep it on content that only mounts once per visit.
 */
export default function FadeSlideIn({ children, delay = 0, style }: FadeSlideInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
