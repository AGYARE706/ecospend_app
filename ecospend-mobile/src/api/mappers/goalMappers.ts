import type { GoalColorKey, SavingsGoal } from '../../types';

const GOAL_COLORS: GoalColorKey[] = [
  'primaryBackground',
  'blueLight',
  'warningLight',
  'successLight',
];

interface ApiGoal {
  id: string;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  deadline?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}

export function mapGoal(dto: ApiGoal, index = 0): SavingsGoal {
  return {
    id: String(dto.id),
    name: dto.name,
    targetAmount: Number(dto.targetAmount),
    currentAmount: Number(dto.currentAmount),
    deadline: dto.deadline ?? null,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    completedAt: dto.completedAt ?? null,
    color: GOAL_COLORS[index % GOAL_COLORS.length],
  };
}
