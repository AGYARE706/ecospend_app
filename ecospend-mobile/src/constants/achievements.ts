import { colors } from '../theme';
import type { AchievementDefinition, AchievementId } from '../types/achievement';

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_goal_achieved',
    title: 'First Goal Achieved',
    description: 'Complete your first savings goal.',
    icon: 'flag',
    iconColor: colors.primary,
    iconBackground: colors.primaryBackground,
    accentColor: colors.primary,
    target: 1,
  },
  {
    id: 'first_vault_created',
    title: 'First Vault Created',
    description: 'Create your first personal vault.',
    icon: 'lock-closed',
    iconColor: colors.blue,
    iconBackground: colors.blueLight,
    accentColor: colors.blue,
    target: 1,
  },
  {
    id: 'first_vault_matured',
    title: 'First Vault Matured',
    description: 'Reach maturity on a vault for the first time.',
    icon: 'shield-checkmark',
    iconColor: '#0D9488',
    iconBackground: '#E0F2F1',
    accentColor: '#0D9488',
    target: 1,
  },
  {
    id: 'thirty_day_streak',
    title: '30-Day Streak',
    description: 'Stay active and save consistently for 30 days.',
    icon: 'flame',
    iconColor: colors.warning,
    iconBackground: colors.orangeLight,
    accentColor: colors.warning,
    target: 30,
  },
  {
    id: 'hundred_transactions',
    title: '100 Transactions Logged',
    description: 'Track 100 income or expense transactions.',
    icon: 'receipt',
    iconColor: '#6A1B9A',
    iconBackground: '#F3E5F5',
    accentColor: '#6A1B9A',
    target: 100,
  },
];

export const ACHIEVEMENT_ORDER: AchievementId[] = [
  'first_goal_achieved',
  'first_vault_created',
  'first_vault_matured',
  'thirty_day_streak',
  'hundred_transactions',
];
