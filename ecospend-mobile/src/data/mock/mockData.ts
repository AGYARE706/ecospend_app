import type {
  BudgetEnvelope,
  Envelope,
  MonthlySummary,
  SavingsGoal,
  Transaction,
  User,
  WeeklyInsight,
} from '../../types';

export const mockUser: User = {
  name: 'Kwame Mensah',
  phone: '0241234567',
  tier: 'FREE',
};

export const mockMonthlySummary: MonthlySummary = {
  totalIncome: 5200,
  totalExpense: 1950,
  netBalance: 3250,
  transactionCount: 47,
};

export const MOCK_LOADING_DELAY_MS = 1000;
export const MOCK_SAVE_DELAY_MS = 1000;
export const MOCK_GOAL_SAVE_DELAY_MS = 800;
export const MOCK_GOAL_CONTRIBUTE_DELAY_MS = 800;
export const MOCK_ENVELOPE_SAVE_DELAY_MS = 800;

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

export const mockEnvelopes: Envelope[] = [
  {
    id: 'env-food',
    category: 'Food',
    emoji: '🍔',
    monthlyLimit: 600,
    currentSpend: 520,
    month: currentMonth,
    year: currentYear,
    color: 'errorLight',
  },
  {
    id: 'env-transport',
    category: 'Transport',
    emoji: '🚗',
    monthlyLimit: 300,
    currentSpend: 180,
    month: currentMonth,
    year: currentYear,
    color: 'warningLight',
  },
  {
    id: 'env-utilities',
    category: 'Utilities',
    emoji: '💡',
    monthlyLimit: 200,
    currentSpend: 80,
    month: currentMonth,
    year: currentYear,
    color: 'blueLight',
  },
  {
    id: 'env-business',
    category: 'Business',
    emoji: '💼',
    monthlyLimit: 1000,
    currentSpend: 950,
    month: currentMonth,
    year: currentYear,
    color: 'warningLight',
  },
  {
    id: 'env-savings',
    category: 'Savings',
    emoji: '🏦',
    monthlyLimit: 500,
    currentSpend: 500,
    month: currentMonth,
    year: currentYear,
    color: 'successLight',
  },
  {
    id: 'env-other',
    category: 'Other',
    emoji: '📦',
    monthlyLimit: 150,
    currentSpend: 20,
    month: currentMonth,
    year: currentYear,
    color: 'primaryBackground',
  },
];

export const mockBudgetEnvelopes: BudgetEnvelope[] = mockEnvelopes
  .slice(0, 3)
  .map((envelope) => ({
    id: envelope.id,
    category: envelope.category,
    emoji: envelope.emoji,
    spent: envelope.currentSpend,
    limit: envelope.monthlyLimit,
  }));

export const mockWeeklyInsight: WeeklyInsight = {
  heading: "This week's insight",
  message: 'Food is your top spend this week — GHS 340 in 4 transactions',
};

function tx(
  id: string,
  type: Transaction['type'],
  amount: number,
  category: Transaction['category'],
  date: string,
  provider?: Transaction['provider'],
  notes?: string,
): Transaction {
  return { id, type, amount, category, date, provider, notes };
}

export const mockTransactions: Transaction[] = [
  tx('tx-001', 'expense', 25, 'Food', '2026-06-14T08:30:00.000Z', 'MTN MoMo', 'Waakye breakfast'),
  tx('tx-002', 'expense', 15, 'Transport', '2026-06-14T07:45:00.000Z', 'MTN MoMo', 'Trotro to work'),
  tx('tx-003', 'expense', 120, 'Utilities', '2026-06-13T18:00:00.000Z', 'Telecel Cash', 'ECG top-up'),
  tx('tx-004', 'expense', 45, 'Food', '2026-06-13T13:00:00.000Z', 'MTN MoMo', 'Lunch at chop bar'),
  tx('tx-005', 'expense', 350, 'Business', '2026-06-13T10:00:00.000Z', 'AT Money', 'Stock purchase'),
  tx('tx-006', 'income', 1500, 'Business', '2026-06-12T16:00:00.000Z', undefined, 'Side hustle payment'),
  tx('tx-007', 'expense', 80, 'Transport', '2026-06-12T09:00:00.000Z', 'Telecel Cash', 'Uber ride'),
  tx('tx-008', 'expense', 200, 'Food', '2026-06-11T19:30:00.000Z', 'MTN MoMo', 'Family dinner'),
  tx('tx-009', 'expense', 500, 'Savings', '2026-06-11T12:00:00.000Z', 'MTN MoMo', 'Vault deposit'),
  tx('tx-010', 'expense', 35, 'Food', '2026-06-11T08:00:00.000Z', 'MTN MoMo'),
  tx('tx-011', 'expense', 150, 'Utilities', '2026-06-10T17:00:00.000Z', 'Telecel Cash', 'Water bill'),
  tx('tx-012', 'expense', 60, 'Transport', '2026-06-10T07:30:00.000Z', 'MTN MoMo'),
  tx('tx-013', 'income', 3500, 'Business', '2026-06-09T09:00:00.000Z', undefined, 'Monthly salary'),
  tx('tx-014', 'expense', 90, 'Food', '2026-06-09T13:00:00.000Z', 'AT Money'),
  tx('tx-015', 'expense', 250, 'Other', '2026-06-08T15:00:00.000Z', 'MTN MoMo', 'Phone accessories'),
  tx('tx-016', 'expense', 40, 'Transport', '2026-06-08T08:00:00.000Z', 'Telecel Cash'),
  tx('tx-017', 'expense', 180, 'Food', '2026-06-07T19:00:00.000Z', 'MTN MoMo', 'Weekend outing'),
  tx('tx-018', 'expense', 75, 'Utilities', '2026-06-07T11:00:00.000Z', 'MTN MoMo', 'Data bundle'),
  tx('tx-019', 'expense', 800, 'Business', '2026-06-06T14:00:00.000Z', 'AT Money', 'Supplier payment'),
  tx('tx-020', 'income', 200, 'Other', '2026-06-06T10:00:00.000Z', undefined, 'Gift from family'),
  tx('tx-021', 'expense', 55, 'Food', '2026-06-05T12:30:00.000Z', 'MTN MoMo'),
  tx('tx-022', 'expense', 20, 'Transport', '2026-06-05T07:00:00.000Z', 'Telecel Cash'),
  tx('tx-023', 'expense', 300, 'Savings', '2026-06-04T16:00:00.000Z', 'MTN MoMo', 'Emergency fund'),
  tx('tx-024', 'expense', 110, 'Food', '2026-06-03T18:00:00.000Z', 'MTN MoMo'),
  tx('tx-025', 'expense', 950, 'Utilities', '2026-06-02T10:00:00.000Z', 'Telecel Cash', 'Rent contribution'),
  tx('tx-026', 'expense', 65, 'Transport', '2026-06-01T08:00:00.000Z', 'MTN MoMo'),
  tx('tx-027', 'income', 1200, 'Business', '2026-05-28T11:00:00.000Z', undefined, 'Freelance project'),
  tx('tx-028', 'expense', 420, 'Food', '2026-05-27T19:00:00.000Z', 'MTN MoMo', 'Party supplies'),
  tx('tx-029', 'expense', 1500, 'Business', '2026-05-25T14:00:00.000Z', 'AT Money', 'Equipment'),
  tx('tx-030', 'expense', 85, 'Transport', '2026-05-24T07:30:00.000Z', 'Telecel Cash'),
  tx('tx-031', 'expense', 200, 'Utilities', '2026-05-22T16:00:00.000Z', 'MTN MoMo', 'Internet bill'),
  tx('tx-032', 'expense', 70, 'Food', '2026-05-21T13:00:00.000Z', 'MTN MoMo'),
  tx('tx-033', 'income', 3500, 'Business', '2026-05-09T09:00:00.000Z', undefined, 'Monthly salary'),
  tx('tx-034', 'expense', 600, 'Savings', '2026-05-08T12:00:00.000Z', 'MTN MoMo', 'Goal contribution'),
  tx('tx-035', 'expense', 45, 'Food', '2026-05-07T08:00:00.000Z', 'Telecel Cash'),
  tx('tx-036', 'expense', 180, 'Transport', '2026-05-05T17:00:00.000Z', 'MTN MoMo', 'Inter-city travel'),
  tx('tx-037', 'expense', 320, 'Utilities', '2026-05-03T10:00:00.000Z', 'AT Money', 'Prepaid meter'),
  tx('tx-038', 'expense', 55, 'Other', '2026-05-02T15:00:00.000Z', 'MTN MoMo'),
  tx('tx-039', 'income', 800, 'Business', '2026-04-28T11:00:00.000Z', undefined, 'Consulting fee'),
  tx('tx-040', 'expense', 250, 'Food', '2026-04-26T19:00:00.000Z', 'MTN MoMo', 'Restaurant'),
  tx('tx-041', 'expense', 120, 'Transport', '2026-04-24T08:00:00.000Z', 'Telecel Cash'),
  tx('tx-042', 'expense', 400, 'Business', '2026-04-22T14:00:00.000Z', 'AT Money', 'Office supplies'),
  tx('tx-043', 'income', 3500, 'Business', '2026-04-09T09:00:00.000Z', undefined, 'Monthly salary'),
  tx('tx-044', 'expense', 175, 'Utilities', '2026-04-08T16:00:00.000Z', 'MTN MoMo'),
  tx('tx-045', 'expense', 90, 'Food', '2026-04-06T12:00:00.000Z', 'MTN MoMo'),
  tx('tx-046', 'expense', 2000, 'Savings', '2026-04-05T10:00:00.000Z', 'MTN MoMo', 'Vault lock'),
  tx('tx-047', 'expense', 30, 'Transport', '2026-04-04T07:00:00.000Z', 'Telecel Cash'),
  tx('tx-048', 'expense', 5, 'Food', '2026-04-03T08:00:00.000Z', 'MTN MoMo', 'Bread'),
  tx('tx-049', 'expense', 28, 'Food', '2026-07-10T08:15:00.000Z', 'MTN MoMo', 'Koko and bread'),
  tx('tx-050', 'expense', 18, 'Transport', '2026-07-10T07:30:00.000Z', 'Telecel Cash', 'Trotro fare'),
  tx('tx-051', 'expense', 95, 'Food', '2026-07-09T13:00:00.000Z', 'MTN MoMo', 'Lunch with team'),
  tx('tx-052', 'expense', 220, 'Utilities', '2026-07-09T17:00:00.000Z', 'AT Money', 'ECG prepaid'),
  tx('tx-053', 'income', 3500, 'Business', '2026-07-09T09:00:00.000Z', undefined, 'July salary'),
  tx('tx-054', 'expense', 140, 'Transport', '2026-07-08T18:30:00.000Z', 'MTN MoMo', 'Bolt ride'),
  tx('tx-055', 'expense', 75, 'Food', '2026-07-08T12:00:00.000Z', 'Telecel Cash'),
  tx('tx-056', 'expense', 400, 'Savings', '2026-07-07T11:00:00.000Z', 'MTN MoMo', 'Vault top-up'),
  tx('tx-057', 'expense', 310, 'Business', '2026-07-07T14:00:00.000Z', 'AT Money', 'Supplies'),
  tx('tx-058', 'expense', 52, 'Food', '2026-07-06T19:00:00.000Z', 'MTN MoMo', 'Dinner'),
  tx('tx-059', 'expense', 65, 'Transport', '2026-07-06T08:00:00.000Z', 'Telecel Cash'),
  tx('tx-060', 'income', 1200, 'Business', '2026-07-05T15:00:00.000Z', undefined, 'Freelance gig'),
  tx('tx-061', 'expense', 180, 'Food', '2026-07-04T13:30:00.000Z', 'MTN MoMo', 'Weekend lunch'),
  tx('tx-062', 'expense', 90, 'Utilities', '2026-07-03T10:00:00.000Z', 'MTN MoMo', 'Data bundle'),
  tx('tx-063', 'expense', 42, 'Transport', '2026-07-02T07:45:00.000Z', 'Telecel Cash'),
  tx('tx-064', 'expense', 850, 'Utilities', '2026-07-01T16:00:00.000Z', 'AT Money', 'Rent share'),
  tx('tx-065', 'expense', 38, 'Food', '2026-07-01T08:00:00.000Z', 'MTN MoMo', 'Breakfast'),
];

function addMonths(date: Date, months: number): string {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}

const now = new Date();
const threeMonthsFromNow = addMonths(now, 3);
const sixMonthsFromNow = addMonths(now, 6);
const twoWeeksAgo = new Date(now);
twoWeeksAgo.setDate(now.getDate() - 14);

export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal-001',
    name: 'Shop Rent',
    targetAmount: 2000,
    currentAmount: 1400,
    deadline: threeMonthsFromNow,
    createdAt: '2026-03-01T10:00:00.000Z',
    completedAt: null,
    color: 'blueLight',
  },
  {
    id: 'goal-002',
    name: 'New Sewing Machine',
    targetAmount: 800,
    currentAmount: 800,
    deadline: null,
    createdAt: '2026-01-15T10:00:00.000Z',
    completedAt: twoWeeksAgo.toISOString(),
    color: 'successLight',
  },
  {
    id: 'goal-003',
    name: 'School Fees',
    targetAmount: 3500,
    currentAmount: 500,
    deadline: sixMonthsFromNow,
    createdAt: '2026-02-10T10:00:00.000Z',
    completedAt: null,
    color: 'warningLight',
  },
  {
    id: 'goal-004',
    name: 'Emergency Fund',
    targetAmount: 1000,
    currentAmount: 120,
    deadline: null,
    createdAt: '2026-04-01T10:00:00.000Z',
    completedAt: null,
    color: 'primaryBackground',
  },
];
