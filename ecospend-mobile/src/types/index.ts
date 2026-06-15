export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Utilities'
  | 'Business'
  | 'Savings'
  | 'Other';

export type Provider = 'MTN MoMo' | 'Telecel Cash' | 'AT Money';

export type UserTier = 'FREE';

export type TransactionFilter =
  | 'All'
  | 'Income'
  | 'Expense'
  | TransactionCategory;

export interface User {
  name: string;
  phone: string;
  tier: UserTier;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  provider?: Provider;
  notes?: string;
  date: string;
}

export interface BudgetEnvelope {
  id: string;
  category: TransactionCategory;
  emoji: string;
  spent: number;
  limit: number;
}

export interface WeeklyInsight {
  heading: string;
  message: string;
}

export interface GroupedTransactions {
  title: string;
  data: Transaction[];
}

export interface TransactionSummaryBar {
  income: number;
  expense: number;
  net: number;
}

export interface AddTransactionPayload {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  provider?: Provider;
  notes?: string;
  date: string;
}

export interface AddTransactionFormErrors {
  amount?: string;
  category?: string;
}

export type GoalColorKey =
  | 'primaryBackground'
  | 'blueLight'
  | 'warningLight'
  | 'successLight';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
  color: GoalColorKey;
}

export interface GoalContribution {
  goalId: string;
  amount: number;
  contributedAt: string;
}

export interface AddGoalPayload {
  name: string;
  targetAmount: number;
  deadline: string | null;
}

export interface AddGoalFormErrors {
  name?: string;
  targetAmount?: string;
}

export type GoalsTabMode = 'active' | 'completed';

export type ProviderType = Provider;

export type EnvelopeStatus = 'healthy' | 'atRisk' | 'critical' | 'exhausted';

export type EnvelopeFilter =
  | 'All'
  | 'Healthy'
  | 'At Risk'
  | 'Critical'
  | 'Exhausted';

export type EnvelopeColorKey =
  | 'primaryBackground'
  | 'blueLight'
  | 'warningLight'
  | 'successLight'
  | 'errorLight';

export interface Envelope {
  id: string;
  category: TransactionCategory;
  emoji: string;
  monthlyLimit: number;
  currentSpend: number;
  month: number;
  year: number;
  color: EnvelopeColorKey;
}

export interface FeeTier {
  minAmount: number;
  maxAmount: number | null;
  flatFee?: number;
  percentRate?: number;
  maxFee?: number;
}

export interface FeeSchedule {
  provider: ProviderType;
  approximate: boolean;
  tiers: FeeTier[];
}

export interface FeeResult {
  fee: number;
  totalCost: number;
  amount: number;
  provider: ProviderType;
}

export interface AddEnvelopePayload {
  category: TransactionCategory;
  monthlyLimit: number;
}

export interface EditEnvelopePayload {
  id: string;
  monthlyLimit: number;
}

export interface EnvelopeFormErrors {
  category?: string;
  monthlyLimit?: string;
}
