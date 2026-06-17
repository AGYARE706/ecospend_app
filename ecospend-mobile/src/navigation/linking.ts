import type { LinkingOptions } from '@react-navigation/native';

import type { AppStackParamList } from './types';

export const linking: LinkingOptions<AppStackParamList> = {
  prefixes: ['ecospend://', 'https://ecospend.app'],
  config: {
    screens: {
      Notifications: 'notifications',
      WeeklyInsights: 'insights',
      AddTransaction: 'add-transaction',
      BudgetEnvelopes: 'budget',
      MoMoCalculator: 'calculator',
      CreateGoal: 'goals/create',
      CreateVault: 'vault/create',
      CreateGroupVault: 'group-vault/create',
      JoinGroupVault: 'group-vault/join',
      MainTabs: {
        screens: {
          DashboardTab: {
            screens: {
              Dashboard: 'home',
            },
          },
          TransactionsTab: {
            screens: {
              TransactionsList: 'transactions',
              TransactionDetails: 'transactions/:transactionId',
              EditTransaction: 'transactions/:transactionId/edit',
            },
          },
          GoalsTab: {
            screens: {
              SavingsGoals: 'goals',
              GoalDetails: 'goals/:goalId',
              EditGoal: 'goals/:goalId/edit',
            },
          },
          VaultTab: {
            screens: {
              VaultDashboard: 'vault',
              VaultDetails: 'vault/:vaultId',
              VaultHistory: 'vault/:vaultId/history',
              GroupVaultDashboard: 'group-vault',
              GroupVaultDetails: 'group-vault/:groupVaultId',
              WithdrawalApproval: 'group-vault/:groupVaultId/approval/:requestId',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
              EditProfile: 'profile/edit',
              Subscription: 'profile/subscription',
              Security: 'profile/security',
              NotificationSettings: 'profile/notifications',
              HelpSupport: 'profile/help',
              About: 'profile/about',
              BadgesAndStreaks: 'profile/badges',
            },
          },
        },
      },
    },
  },
};
