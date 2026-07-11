import { useGoals } from '../context/GoalsContext';

/**
 * Thin wrapper over GoalsContext for savings goals screens.
 */
export function useSavingsGoals() {
  return useGoals();
}
