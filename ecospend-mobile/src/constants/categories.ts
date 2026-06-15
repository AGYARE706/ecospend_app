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

export const ALL_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Utilities',
  'Business',
  'Savings',
  'Other',
];

export const PROVIDERS = ['MTN MoMo', 'Telecel Cash', 'AT Money'] as const;
