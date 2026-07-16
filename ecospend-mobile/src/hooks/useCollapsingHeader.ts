import { useRef } from 'react';
import { Animated } from 'react-native';

export interface CollapsingHeaderControls {
  scrollY: Animated.Value;
  onScroll: ReturnType<typeof Animated.event>;
  scrollEventThrottle: number;
  /** Apply to the screen's existing hero header content (fades + lifts away). */
  heroStyle: { opacity: Animated.AnimatedInterpolation<number>; transform: { translateY: Animated.AnimatedInterpolation<number> }[] };
  /** Apply to the pinned CollapsedHeaderBar (fades in as the hero scrolls out). */
  barStyle: { opacity: Animated.AnimatedInterpolation<number> };
}

/**
 * Drives an iOS-large-title-style collapsing header: a screen's full hero
 * content (greeting, balance, etc.) fades/lifts away as the user scrolls,
 * while a slim pinned bar (title + key actions) fades in to replace it —
 * so navigation context is never fully lost, however far down you scroll.
 *
 * Pair with `CollapsedHeaderBar`. The hero content stays wherever it
 * already lives inside the screen's ScrollView; the bar renders as a
 * sibling ABOVE the ScrollView so it never itself scrolls.
 */
export function useCollapsingHeader(collapseDistance = 70): CollapsingHeaderControls {
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useRef(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true,
    }),
  ).current;

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [0, -12],
    extrapolate: 'clamp',
  });
  const barOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.55, collapseDistance],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return {
    scrollY,
    onScroll,
    scrollEventThrottle: 16,
    heroStyle: { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
    barStyle: { opacity: barOpacity },
  };
}
