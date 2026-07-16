import { CATEGORY_CONFIG } from '../../constants/categories';
import type { Envelope, EnvelopeColorKey, TransactionCategory } from '../../types';

const ENVELOPE_COLORS: EnvelopeColorKey[] = [
  'primaryBackground',
  'blueLight',
  'warningLight',
  'successLight',
  'errorLight',
];

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

interface ApiEnvelope {
  id: string;
  category: string;
  monthlyLimit: number | string;
  currentSpend: number | string;
  month: number;
  year: number;
}

function mapCategory(value: string): TransactionCategory {
  const match = CATEGORIES.find(
    (item) => item.toLowerCase() === value.toLowerCase(),
  );
  return match ?? 'Other';
}

export function mapEnvelope(dto: ApiEnvelope, index = 0): Envelope {
  const category = mapCategory(dto.category);
  return {
    id: String(dto.id),
    category,
    emoji: CATEGORY_CONFIG[category].emoji,
    monthlyLimit: Number(dto.monthlyLimit),
    currentSpend: Number(dto.currentSpend),
    month: dto.month,
    year: dto.year,
    color: ENVELOPE_COLORS[index % ENVELOPE_COLORS.length],
  };
}
