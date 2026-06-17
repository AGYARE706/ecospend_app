/**
 * Layered elevation system. Use shadowSm for resting chips/inputs,
 * shadowMd for cards, and shadowLg for floating/hero surfaces.
 */
export const shadowSm = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 1,
} as const;

export const shadowMd = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 3,
} as const;

export const shadowLg = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.14,
  shadowRadius: 24,
  elevation: 8,
} as const;

/** Backwards-compatible aliases. */
export const subtleShadow = shadowSm;
export const cardShadow = shadowMd;
