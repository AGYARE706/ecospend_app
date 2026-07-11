import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth ────────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { phone: string };
};

// ─── Per-feature stacks ───────────────────────────────────────────────────────
export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionDetails: { transactionId: string };
  EditTransaction: { transactionId: string };
};

export type GoalsStackParamList = {
  SavingsGoals: undefined;
  GoalDetails: { goalId: string };
  EditGoal: { goalId: string };
};

export type VaultStackParamList = {
  VaultDashboard: undefined;
  VaultDetails: { vaultId: string };
  VaultHistory: { vaultId: string };
  GroupVaultDashboard: undefined;
  GroupVaultDetails: { groupVaultId: string };
  WithdrawalApproval: { groupVaultId: string; requestId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Subscription: undefined;
  Security: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  About: undefined;
  BadgesAndStreaks: undefined;
};

// ─── Bottom Tabs ─────────────────────────────────────────────────────────────
export type TabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList>;
  GoalsTab: NavigatorScreenParams<GoalsStackParamList>;
  VaultTab: NavigatorScreenParams<VaultStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ─── Root App Stack (global modals + tabs) ───────────────────────────────────
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  // Transactions
  AddTransaction: undefined;
  // Goals
  CreateGoal: undefined;
  AddGoalContribution: { goalId: string };
  // Budget (fullscreen modal — accessible from Dashboard + Goals)
  BudgetEnvelopes: undefined;
  // Calculator (fullscreen modal — accessible from Dashboard + Transactions)
  MoMoCalculator: undefined;
  // Vault
  CreateVault: undefined;
  WithdrawVault: { vaultId: string };
  VaultSuccess: {
    /** Generic success headline (used by CreateVault flow) */
    message?: string;
    /** Withdrawal-specific fields — present only when coming from WithdrawVault */
    vaultName?: string;
    amountReceived?: number;
    feeCharged?: number;
    isWithdrawal?: boolean;
  };
  // Group Vault
  CreateGroupVault: undefined;
  JoinGroupVault: undefined;
  // Global overlays
  Notifications: undefined;
  WeeklyInsights: undefined;
};

/** @deprecated Use TabParamList instead */
export type AppTabParamList = TabParamList;
