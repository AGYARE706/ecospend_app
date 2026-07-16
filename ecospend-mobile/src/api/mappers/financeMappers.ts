import type {
  MonthlySummary,
  Provider,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../../types';

const API_TO_PROVIDER: Record<string, Provider> = {
  MTN: 'MTN MoMo',
  TELECEL: 'Telecel Cash',
  AT: 'AT Money',
  'MTN MoMo': 'MTN MoMo',
  'Telecel Cash': 'Telecel Cash',
  'AT Money': 'AT Money',
};

export function providerFromApi(provider?: string | null): Provider | undefined {
  if (!provider) {
    return undefined;
  }
  return API_TO_PROVIDER[provider] ?? API_TO_PROVIDER[provider.toUpperCase()];
}

interface ApiTransaction {
  id: string;
  type: string;
  amount: number | string;
  category?: string;
  provider?: string | null;
  notes?: string | null;
  createdAt?: string;
}

const CATEGORIES: TransactionCategory[] = [
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

function mapCategory(value?: string): TransactionCategory {
  if (!value) {
    return 'Other';
  }
  const match = CATEGORIES.find(
    (item) => item.toLowerCase() === value.toLowerCase(),
  );
  return match ?? 'Other';
}

function mapType(value?: string): TransactionType {
  return value?.toUpperCase() === 'INCOME' ? 'income' : 'expense';
}

export function mapTransaction(dto: ApiTransaction): Transaction {
  return {
    id: String(dto.id),
    type: mapType(dto.type),
    amount: Number(dto.amount),
    category: mapCategory(dto.category),
    provider: providerFromApi(dto.provider),
    notes: dto.notes ?? undefined,
    date: dto.createdAt ?? new Date().toISOString(),
  };
}

export function mapSummary(dto: {
  totalIncome: number | string;
  totalExpense: number | string;
  netBalance: number | string;
  transactionCount: number | string;
}): MonthlySummary {
  return {
    totalIncome: Number(dto.totalIncome),
    totalExpense: Number(dto.totalExpense),
    netBalance: Number(dto.netBalance),
    transactionCount: Number(dto.transactionCount),
  };
}
