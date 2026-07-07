import type { ColorToken } from '../theme';
import type { TransactionCategory } from '../types';

/**
 * Category colors are stored as semantic token names so they stay static and
 * theme-agnostic — resolve them against the active theme at the call site,
 * e.g. `colors[config.circleBackground]`.
 */
export interface CategoryConfig {
  emoji: string;
  circleBackground: ColorToken;
  label: string;
}

export const CATEGORY_CONFIG: Record<TransactionCategory, CategoryConfig> = {
  Food: {
    emoji: '🍔',
    circleBackground: 'warningLight',
    label: 'Food',
  },
  Transport: {
    emoji: '🚗',
    circleBackground: 'blueLight',
    label: 'Transport',
  },
  Utilities: {
    emoji: '💡',
    circleBackground: 'warningLight',
    label: 'Utilities',
  },
  Business: {
    emoji: '💼',
    circleBackground: 'blueLight',
    label: 'Business',
  },
  Savings: {
    emoji: '🏦',
    circleBackground: 'successLight',
    label: 'Savings',
  },
  Other: {
    emoji: '📦',
    circleBackground: 'divider',
    label: 'Other',
  },
};

/**
 * SVG visual identity per category — a consistent icon, foreground tint and
 * tinted medallion background. Prefer this over the legacy emoji config.
 * Tints/backgrounds are token names; resolve via the active theme's colors.
 */
export interface CategoryVisual {
  icon: string;
  tint: ColorToken;
  background: ColorToken;
}

export const CATEGORY_VISUALS: Record<TransactionCategory, CategoryVisual> = {
  Food: { icon: 'utensils', tint: 'warning', background: 'warningLight' },
  Transport: { icon: 'car', tint: 'blue', background: 'blueLight' },
  Utilities: { icon: 'bulb', tint: 'gold', background: 'goldLight' },
  Business: { icon: 'briefcase', tint: 'accent', background: 'accentLight' },
  Savings: { icon: 'bank', tint: 'primary', background: 'primaryBackground' },
  Other: { icon: 'box', tint: 'textSecondary', background: 'chipBg' },
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

/**
 * Goal categories for savings goals
 */
export interface GoalCategoryConfig {
  emoji: string;
  label: string;
}

export const GOAL_CATEGORIES: Record<string, GoalCategoryConfig> = {
  emergency: { emoji: '🚨', label: 'Emergency Fund' },
  vacation: { emoji: '✈️', label: 'Vacation' },
  education: { emoji: '🎓', label: 'Education' },
  home: { emoji: '🏠', label: 'Home' },
  car: { emoji: '🚗', label: 'Vehicle' },
  debt: { emoji: '💳', label: 'Debt Payment' },
  investment: { emoji: '📈', label: 'Investment' },
  other: { emoji: '🎯', label: 'Other' },
};
