/**
 * Motion tokens. Animations should be quick, purposeful and consistent —
 * use these durations and the spring presets rather than ad-hoc numbers.
 */
import { Easing } from 'react-native';

export const duration = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 320,
} as const;

export const easing = {
  /** Default for most enter/exit + state changes. */
  standard: Easing.bezier(0.2, 0, 0, 1),
  /** Decelerate — entering elements. */
  decelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** Accelerate — exiting elements. */
  accelerate: Easing.bezier(0.3, 0, 1, 1),
} as const;

/** Press-feedback scale used across tappable surfaces. */
export const pressScale = {
  subtle: 0.99,
  card: 0.985,
  button: 0.97,
  icon: 0.94,
} as const;

/** Spring config for Animated.spring micro-interactions. */
export const spring = {
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  snappy: { damping: 22, stiffness: 260, mass: 0.9 },
} as const;
