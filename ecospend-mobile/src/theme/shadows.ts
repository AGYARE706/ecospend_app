/**
 * Layered elevation system. Use shadowXs for hairline lift, shadowSm for
 * resting chips/inputs, shadowMd for cards, and shadowLg for floating/hero
 * surfaces. Shadows are cool-toned to match the neutral slate palette.
 */
const SHADOW_TINT = '#0B1220';

export const shadowXs = {
  shadowColor: SHADOW_TINT,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 1,
} as const;

export const shadowSm = {
  shadowColor: SHADOW_TINT,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;

export const shadowMd = {
  shadowColor: SHADOW_TINT,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
} as const;

export const shadowLg = {
  shadowColor: SHADOW_TINT,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.13,
  shadowRadius: 24,
  elevation: 8,
} as const;

/** Brand-tinted glow for primary CTAs and the hero balance card. */
export const shadowBrand = {
  shadowColor: '#0B7E43',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.24,
  shadowRadius: 18,
  elevation: 6,
} as const;

/** Backwards-compatible aliases. */
export const subtleShadow = shadowSm;
export const cardShadow = shadowMd;
