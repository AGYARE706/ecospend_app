/**
 * Corner radius scale. Component-semantic aliases (card, button, sheet…) keep
 * the system cohesive — pick the role, not the number.
 */
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  // Component roles
  control: 12,
  button: 14,
  input: 14,
  chip: 999,
  card: 18,
  goalCard: 16,
  providerCard: 14,
  heroCard: 22,
  sheet: 26,
  full: 999,
} as const;
