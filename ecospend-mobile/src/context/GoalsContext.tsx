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

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as goalsApi from '../api/goalsApi';
import { useAuth } from './AuthContext';
import { useFinance } from './FinanceContext';
import { useWallet } from './WalletContext';
import type {
  AddGoalPayload,
  GoalsTabMode,
  SavingsGoal,
  UpdateGoalPayload,
} from '../types';
import { isGoalCompleted } from '../utils/goals';

const TOAST_DURATION_MS = 2000;

interface GoalsContextValue {
  goals: SavingsGoal[];
  activeGoals: SavingsGoal[];
  completedGoals: SavingsGoal[];
  loading: boolean;
  activeTab: GoalsTabMode;
  setActiveTab: (tab: GoalsTabMode) => void;
  addGoal: (payload: AddGoalPayload) => Promise<boolean>;
  contributeToGoal: (goalId: string, amount: number) => Promise<boolean>;
  withdrawFromGoal: (goalId: string, amount: number) => Promise<boolean>;
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
  const { isAuthenticated } = useAuth();
  const { refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GoalsTabMode>('active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const refreshGoals = useCallback(async () => {
    if (!isAuthenticated) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await goalsApi.listGoals();
      setGoals(list);
    } catch (error) {
      console.warn('Failed to load goals', getApiErrorMessage(error));
      showToast(getApiErrorMessage(error, 'Could not load goals'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    void refreshGoals();
  }, [refreshGoals]);

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
      try {
        const nextGoal = await goalsApi.createGoal(payload);
        setGoals((current) => [nextGoal, ...current]);
        showToast('Goal created!');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not create goal'));
        return false;
      } finally {
        setIsSavingGoal(false);
      }
    },
    [showToast],
  );

  const contributeToGoal = useCallback(
    async (goalId: string, amount: number): Promise<boolean> => {
      setIsContributing(true);
      try {
        const updated = await goalsApi.contributeToGoal(goalId, amount);
        setGoals((current) =>
          current.map((goal) => (goal.id === goalId ? updated : goal)),
        );
        void refreshWallet();
        void refreshTransactions();
        showToast(`GHS ${amount.toFixed(2)} moved from wallet to ${updated.name}!`);
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not contribute'));
        return false;
      } finally {
        setIsContributing(false);
      }
    },
    [refreshTransactions, refreshWallet, showToast],
  );

  const withdrawFromGoal = useCallback(
    async (goalId: string, amount: number): Promise<boolean> => {
      setIsContributing(true);
      try {
        const updated = await goalsApi.withdrawFromGoal(goalId, amount);
        setGoals((current) =>
          current.map((goal) => (goal.id === goalId ? updated : goal)),
        );
        void refreshWallet();
        void refreshTransactions();
        showToast(`GHS ${amount.toFixed(2)} moved back to your wallet`);
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not withdraw'));
        return false;
      } finally {
        setIsContributing(false);
      }
    },
    [refreshTransactions, refreshWallet, showToast],
  );

  const updateGoal = useCallback(
    async (goalId: string, payload: UpdateGoalPayload): Promise<boolean> => {
      setIsSavingGoal(true);
      try {
        const updated = await goalsApi.updateGoal(goalId, payload);
        setGoals((current) =>
          current.map((goal) => (goal.id === goalId ? updated : goal)),
        );
        showToast('Goal updated!');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not update goal'));
        return false;
      } finally {
        setIsSavingGoal(false);
      }
    },
    [showToast],
  );

  const deleteGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      setIsSavingGoal(true);
      try {
        await goalsApi.deleteGoal(goalId);
        setGoals((current) => current.filter((goal) => goal.id !== goalId));
        showToast('Goal deleted');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not delete goal'));
        return false;
      } finally {
        setIsSavingGoal(false);
      }
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
      withdrawFromGoal,
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
      withdrawFromGoal,
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
