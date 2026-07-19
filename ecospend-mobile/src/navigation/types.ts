import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth ────────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { phone: string };
  VerifyOtp: { phone: string; purpose: 'register' | 'login' };
};

// ─── Compulsory first-login account setup ─────────────────────────────────────
export type AccountSetupStackParamList = {
  SetupWelcome: undefined;
  SetupIncome: undefined;
  SetupBudgets: undefined;
  SetupNotifications: undefined;
};

// ─── Per-feature stacks ───────────────────────────────────────────────────────
export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionDetails: { transactionId: string };
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
  GroupVaultActivity: { groupVaultId: string };
  GroupVaultMembers: { groupVaultId: string };
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
  Learn: undefined;
  LessonTrack: { trackId: string };
  LessonDetail: { lessonId: string };
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
  // Goals
  CreateGoal: undefined;
  AddGoalContribution: { goalId: string };
  WithdrawFromGoal: { goalId: string };
  // Budget (fullscreen modal — accessible from Dashboard + Goals)
  BudgetEnvelopes: undefined;
  // Wallet (money in/out of the app via Paystack)
  TopUpWallet: undefined;
  SendMoney: undefined;
  // Bills (recurring subscriptions paid from the wallet)
  Bills: undefined;
  AddBill: undefined;
  // Vault
  CreateVault: undefined;
  AddMoney: { vaultId: string };
  WithdrawVault: { vaultId: string };
  VaultSuccess: {
    /** Generic success headline (used by CreateVault flow) */
    message?: string;
    /** Withdrawal-specific fields — present only when coming from WithdrawVault */
    vaultName?: string;
    amountReceived?: number;
    feeCharged?: number;
    isWithdrawal?: boolean;
    /** The real personal vault this success screen is about, if any. */
    vaultId?: string;
    /** The real group vault this success screen is about, if any. */
    groupVaultId?: string;
  };
  // Group Vault
  CreateGroupVault: undefined;
  JoinGroupVault: { inviteCode?: string } | undefined;
  ContributeGroup: { groupVaultId: string };
  RequestGroupWithdrawal: { groupVaultId: string };
  // Global overlays
  Notifications: undefined;
  WeeklyInsights: undefined;
  AskCoach: undefined;
};

/** @deprecated Use TabParamList instead */
export type AppTabParamList = TabParamList;
