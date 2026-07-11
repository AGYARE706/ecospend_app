import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  UpdateGoalPayload,
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

interface GoalsContextValue {
  goals: SavingsGoal[];
  activeGoals: SavingsGoal[];
  completedGoals: SavingsGoal[];
  loading: boolean;
  activeTab: GoalsTabMode;
  setActiveTab: (tab: GoalsTabMode) => void;
  addGoal: (payload: AddGoalPayload) => Promise<boolean>;
  contributeToGoal: (goalId: string, amount: number) => Promise<boolean>;
  updateGoal: (goalId: string, payload: UpdateGoalPayload) => Promise<boolean>;
  deleteGoal: (goalId: string) => Promise<boolean>;
  getGoalById: (goalId: string) => SavingsGoal | undefined;
  toastMessage: string | null;
  clearToast: () => void;
  totalSaved: number;
  activeGoalCount: number;
  isSavingGoal: boolean;
  isContributing: boolean;
}

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
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

  const getGoalById = useCallback(
    (goalId: string) => goals.find((goal) => goal.id === goalId),
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

          const nextAmount = Math.min(
            goal.currentAmount + amount,
            goal.targetAmount,
          );
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

  const updateGoal = useCallback(
    async (goalId: string, payload: UpdateGoalPayload): Promise<boolean> => {
      setIsSavingGoal(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_GOAL_SAVE_DELAY_MS));

      setGoals((current) =>
        current.map((goal) => {
          if (goal.id !== goalId) {
            return goal;
          }

          const nextAmount =
            payload.currentAmount !== undefined
              ? payload.currentAmount
              : goal.currentAmount;
          const nextTarget =
            payload.targetAmount !== undefined
              ? payload.targetAmount
              : goal.targetAmount;
          const completed = nextAmount >= nextTarget;

          return {
            ...goal,
            name: payload.name ?? goal.name,
            targetAmount: nextTarget,
            currentAmount: nextAmount,
            deadline:
              payload.deadline !== undefined ? payload.deadline : goal.deadline,
            completedAt: completed
              ? goal.completedAt ?? new Date().toISOString()
              : null,
          };
        }),
      );

      setIsSavingGoal(false);
      showToast('Goal updated!');
      return true;
    },
    [showToast],
  );

  const deleteGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      setIsSavingGoal(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_GOAL_SAVE_DELAY_MS));

      setGoals((current) => current.filter((goal) => goal.id !== goalId));
      setIsSavingGoal(false);
      showToast('Goal deleted');
      return true;
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      goals,
      activeGoals,
      completedGoals,
      loading,
      activeTab,
      setActiveTab,
      addGoal,
      contributeToGoal,
      updateGoal,
      deleteGoal,
      getGoalById,
      toastMessage,
      clearToast,
      totalSaved,
      activeGoalCount: activeGoals.length,
      isSavingGoal,
      isContributing,
    }),
    [
      activeGoals,
      activeTab,
      addGoal,
      clearToast,
      completedGoals,
      contributeToGoal,
      deleteGoal,
      getGoalById,
      goals,
      isContributing,
      isSavingGoal,
      loading,
      toastMessage,
      totalSaved,
      updateGoal,
    ],
  );

  return (
    <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
  );
}

export function useGoals(): GoalsContextValue {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
