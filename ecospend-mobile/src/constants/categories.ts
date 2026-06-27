import { colors } from '../theme';
import type { TransactionCategory } from '../types';

export interface CategoryConfig {
  emoji: string;
  circleBackground: string;
  label: string;
}

export const CATEGORY_CONFIG: Record<TransactionCategory, CategoryConfig> = {
  Food: {
    emoji: '🍔',
    circleBackground: colors.warningLight,
    label: 'Food',
  },
  Transport: {
    emoji: '🚗',
    circleBackground: colors.blueLight,
    label: 'Transport',
  },
  Utilities: {
    emoji: '💡',
    circleBackground: colors.warningLight,
    label: 'Utilities',
  },
  Business: {
    emoji: '💼',
    circleBackground: colors.blueLight,
    label: 'Business',
  },
  Savings: {
    emoji: '🏦',
    circleBackground: colors.successLight,
    label: 'Savings',
  },
  Other: {
    emoji: '📦',
    circleBackground: colors.divider,
    label: 'Other',
  },
};

/**
 * SVG visual identity per category — a consistent icon, foreground tint and
 * tinted medallion background. Prefer this over the legacy emoji config.
 */
export interface CategoryVisual {
  icon: string;
  tint: string;
  background: string;
}

export const CATEGORY_VISUALS: Record<TransactionCategory, CategoryVisual> = {
  Food: { icon: 'utensils', tint: colors.warning, background: colors.warningLight },
  Transport: { icon: 'car', tint: colors.blue, background: colors.blueLight },
  Utilities: { icon: 'bulb', tint: colors.gold, background: colors.goldLight },
  Business: { icon: 'briefcase', tint: colors.accent, background: colors.accentLight },
  Savings: { icon: 'bank', tint: colors.primary, background: colors.primaryBackground },
  Other: { icon: 'box', tint: colors.textSecondary, background: colors.chipBg },
};

/** Resolve a category visual from any string, falling back to "Other". */
export function getCategoryVisual(category: string): CategoryVisual {
  return (
    CATEGORY_VISUALS[category as TransactionCategory] ?? CATEGORY_VISUALS.Other
  );
}

export const ALL_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Utilities',
  'Business',
  'Savings',
  'Other',
];

export const PROVIDERS = ['MTN MoMo', 'Telecel Cash', 'AT Money'] as const;
