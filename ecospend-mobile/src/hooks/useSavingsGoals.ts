import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  MOCK_GOAL_CONTRIBUTE_DELAY_MS,
  MOCK_GOAL_SAVE_DELAY_MS,
  MOCK_LOADING_DELAY_MS,
  mockSavingsGoals,
} from '../data/mock/mockData';
import type {
  AddGoalPayload,
  GoalColorKey,
  GoalsTabMode,
  SavingsGoal,
} from '../types';
import { isGoalCompleted } from '../utils/goals';

const GOAL_COLORS: GoalColorKey[] = [
  'primaryBackground',
  'blueLight',
  'warningLight',
  'successLight',
];

const TOAST_DURATION_MS = 2000;

function createGoalId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Manages savings goals state, tab mode, loading, toasts, and mock add/contribute operations.
 */
export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GoalsTabMode>('active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), MOCK_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  }, []);

  const activeGoals = useMemo(
    () => goals.filter((goal) => !isGoalCompleted(goal)),
    [goals],
  );

  const completedGoals = useMemo(
    () => goals.filter((goal) => isGoalCompleted(goal)),
    [goals],
  );

  const totalSaved = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
    [goals],
  );

  const addGoal = useCallback(
    async (payload: AddGoalPayload): Promise<boolean> => {
      setIsSavingGoal(true);

      await new Promise((resolve) => setTimeout(resolve, MOCK_GOAL_SAVE_DELAY_MS));

      const nextGoal: SavingsGoal = {
        id: createGoalId(),
        name: payload.name,
        targetAmount: payload.targetAmount,
        currentAmount: 0,
        deadline: payload.deadline,
        createdAt: new Date().toISOString(),
        completedAt: null,
        color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
      };

      setGoals((current) => [nextGoal, ...current]);
      setIsSavingGoal(false);
      showToast('Goal created!');
      return true;
    },
    [goals.length, showToast],
  );

  const contributeToGoal = useCallback(
    async (goalId: string, amount: number): Promise<boolean> => {
      setIsContributing(true);

      await new Promise((resolve) =>
        setTimeout(resolve, MOCK_GOAL_CONTRIBUTE_DELAY_MS),
      );

      let toastText = '';

      setGoals((current) =>
        current.map((goal) => {
          if (goal.id !== goalId) {
            return goal;
          }

          const nextAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
          const completed = nextAmount >= goal.targetAmount;

          toastText = `GHS ${amount.toFixed(2)} added to ${goal.name}!`;

          return {
            ...goal,
            currentAmount: nextAmount,
            completedAt: completed ? new Date().toISOString() : goal.completedAt,
          };
        }),
      );

      setIsContributing(false);
      showToast(toastText);
      return true;
    },
    [showToast],
  );

  return {
    activeGoals,
    completedGoals,
    loading,
    activeTab,
    setActiveTab,
    addGoal,
    contributeToGoal,
    toastMessage,
    clearToast,
    totalSaved,
    activeGoalCount: activeGoals.length,
    isSavingGoal,
    isContributing,
  };
}
