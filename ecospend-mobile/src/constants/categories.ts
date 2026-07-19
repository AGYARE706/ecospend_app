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
  Rent: {
    emoji: '🏠',
    circleBackground: 'blueLight',
    label: 'Rent',
  },
  Fees: {
    emoji: '🧾',
    circleBackground: 'divider',
    label: 'Fees',
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
  Deposit: {
    emoji: '💰',
    circleBackground: 'successLight',
    label: 'Deposit',
  },
  Transfer: {
    emoji: '📤',
    circleBackground: 'blueLight',
    label: 'Transfer',
  },
  Subscription: {
    emoji: '📅',
    circleBackground: 'warningLight',
    label: 'Subscription',
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
  Rent: { icon: 'key', tint: 'purple', background: 'purpleLight' },
  Fees: { icon: 'tag', tint: 'tealDeep', background: 'tealDeepLight' },
  Business: { icon: 'briefcase', tint: 'accent', background: 'accentLight' },
  Savings: { icon: 'bank', tint: 'primary', background: 'primaryBackground' },
  Deposit: { icon: 'wallet', tint: 'primary', background: 'primaryBackground' },
  Transfer: { icon: 'send', tint: 'blue', background: 'blueLight' },
  Subscription: { icon: 'receipt', tint: 'gold', background: 'goldLight' },
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
  'Rent',
  'Fees',
  'Business',
  'Savings',
  'Deposit',
  'Transfer',
  'Subscription',
  'Other',
];

/**
 * Concrete spending categories the user picks from when sending money —
 * what the payment was FOR. Deliberately excludes bookkeeping categories
 * (Deposit, Transfer, Savings, Subscription) which are assigned
 * automatically by their own flows.
 */
export const SPENDING_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Utilities',
  'Rent',
  'Fees',
  'Business',
  'Other',
];

export const PROVIDERS = ['MTN MoMo', 'Telecel Cash', 'AT Money'] as const;

/**
 * Goal categories for savings goals — single-color SVG icons only,
 * consistent with the rest of the icon system.
 */
export interface GoalCategoryConfig {
  icon: string;
  label: string;
}

export const GOAL_CATEGORIES: Record<string, GoalCategoryConfig> = {
  emergency: { icon: 'alert-triangle', label: 'Emergency Fund' },
  vacation: { icon: 'sun', label: 'Vacation' },
  education: { icon: 'document', label: 'Education' },
  home: { icon: 'home', label: 'Home' },
  car: { icon: 'car', label: 'Vehicle' },
  debt: { icon: 'cash', label: 'Debt Payment' },
  investment: { icon: 'trending-up', label: 'Investment' },
  other: { icon: 'target', label: 'Other' },
};
