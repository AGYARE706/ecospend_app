import { useEnvelopes } from '../context/EnvelopesContext';

/**
 * Thin wrapper over EnvelopesContext for budget envelope screens.
 */
export function useBudgetEnvelopes() {
  return useEnvelopes();
}
