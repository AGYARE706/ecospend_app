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

import * as envelopesApi from '../api/envelopesApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from './AuthContext';
import type {
  AddEnvelopePayload,
  BudgetEnvelope,
  EditEnvelopePayload,
  Envelope,
  EnvelopeFilter,
  TransactionCategory,
} from '../types';
import {
  countByStatus,
  filterEnvelopes,
  formatMonthYear,
  hasCategoryThisMonth,
} from '../utils/envelopes';

const TOAST_DURATION_MS = 2000;

interface EnvelopesContextValue {
  allEnvelopes: Envelope[];
  filteredEnvelopes: Envelope[];
  activeFilter: EnvelopeFilter;
  setFilter: (filter: EnvelopeFilter) => void;
  statusCounts: ReturnType<typeof countByStatus>;
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercent: number;
  currentMonthLabel: string;
  currentMonth: number;
  currentYear: number;
  loading: boolean;
  addEnvelope: (payload: AddEnvelopePayload) => Promise<boolean>;
  editEnvelope: (payload: EditEnvelopePayload) => Promise<boolean>;
  getEnvelopeById: (id: string) => Envelope | undefined;
  dashboardEnvelopes: BudgetEnvelope[];
  toastMessage: string | null;
  clearToast: () => void;
  isSaving: boolean;
  hasCategoryThisMonth: (category: TransactionCategory) => boolean;
}

const EnvelopesContext = createContext<EnvelopesContextValue | undefined>(
  undefined,
);

export function EnvelopesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [allEnvelopes, setAllEnvelopes] = useState<Envelope[]>([]);
  const [activeFilter, setFilter] = useState<EnvelopeFilter>('All');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

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

  const refreshEnvelopes = useCallback(async () => {
    if (!isAuthenticated) {
      setAllEnvelopes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await envelopesApi.listEnvelopes();
      setAllEnvelopes(list);
    } catch (error) {
      console.warn('Failed to load envelopes', getApiErrorMessage(error));
      showToast(getApiErrorMessage(error, 'Could not load envelopes'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    void refreshEnvelopes();
  }, [refreshEnvelopes]);

  const filteredEnvelopes = useMemo(
    () => filterEnvelopes(allEnvelopes, activeFilter),
    [activeFilter, allEnvelopes],
  );

  const statusCounts = useMemo(
    () => countByStatus(allEnvelopes),
    [allEnvelopes],
  );

  const totalLimit = useMemo(
    () => allEnvelopes.reduce((sum, envelope) => sum + envelope.monthlyLimit, 0),
    [allEnvelopes],
  );

  const totalSpent = useMemo(
    () => allEnvelopes.reduce((sum, envelope) => sum + envelope.currentSpend, 0),
    [allEnvelopes],
  );

  const totalRemaining = useMemo(
    () => Math.max(totalLimit - totalSpent, 0),
    [totalLimit, totalSpent],
  );

  const overallPercent = useMemo(() => {
    if (totalLimit <= 0) {
      return 0;
    }

    return Math.min(Math.round((totalSpent / totalLimit) * 100), 100);
  }, [totalLimit, totalSpent]);

  const currentMonthLabel = useMemo(
    () => formatMonthYear(currentMonth, currentYear),
    [currentMonth, currentYear],
  );

  const dashboardEnvelopes = useMemo(
    (): BudgetEnvelope[] =>
      allEnvelopes.slice(0, 4).map((envelope) => ({
        id: envelope.id,
        category: envelope.category,
        emoji: envelope.emoji,
        spent: envelope.currentSpend,
        limit: envelope.monthlyLimit,
      })),
    [allEnvelopes],
  );

  const getEnvelopeById = useCallback(
    (id: string) => allEnvelopes.find((envelope) => envelope.id === id),
    [allEnvelopes],
  );

  const addEnvelope = useCallback(
    async (payload: AddEnvelopePayload): Promise<boolean> => {
      setIsSaving(true);
      try {
        const nextEnvelope = await envelopesApi.createEnvelope(payload);
        setAllEnvelopes((current) => {
          const withoutDuplicate = current.filter(
            (envelope) =>
              !(
                envelope.category === payload.category &&
                envelope.month === currentMonth &&
                envelope.year === currentYear
              ),
          );
          return [nextEnvelope, ...withoutDuplicate];
        });
        showToast(
          `${payload.category} envelope set to GHS ${payload.monthlyLimit.toFixed(2)}`,
        );
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not create envelope'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [currentMonth, currentYear, showToast],
  );

  const editEnvelope = useCallback(
    async (payload: EditEnvelopePayload): Promise<boolean> => {
      setIsSaving(true);
      try {
        const updated = await envelopesApi.updateEnvelope(payload);
        setAllEnvelopes((current) =>
          current.map((envelope) =>
            envelope.id === payload.id ? updated : envelope,
          ),
        );
        showToast(
          `${updated.category} limit updated to GHS ${payload.monthlyLimit.toFixed(2)}`,
        );
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Could not update envelope'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      allEnvelopes,
      filteredEnvelopes,
      activeFilter,
      setFilter,
      statusCounts,
      totalLimit,
      totalSpent,
      totalRemaining,
      overallPercent,
      currentMonthLabel,
      currentMonth,
      currentYear,
      loading,
      addEnvelope,
      editEnvelope,
      getEnvelopeById,
      dashboardEnvelopes,
      toastMessage,
      clearToast,
      isSaving,
      hasCategoryThisMonth: (category: TransactionCategory) =>
        hasCategoryThisMonth(allEnvelopes, category, currentMonth, currentYear),
    }),
    [
      activeFilter,
      addEnvelope,
      allEnvelopes,
      clearToast,
      currentMonth,
      currentMonthLabel,
      currentYear,
      dashboardEnvelopes,
      editEnvelope,
      filteredEnvelopes,
      getEnvelopeById,
      isSaving,
      loading,
      overallPercent,
      statusCounts,
      toastMessage,
      totalLimit,
      totalRemaining,
      totalSpent,
    ],
  );

  return (
    <EnvelopesContext.Provider value={value}>
      {children}
    </EnvelopesContext.Provider>
  );
}

export function useEnvelopes(): EnvelopesContextValue {
  const context = useContext(EnvelopesContext);
  if (!context) {
    throw new Error('useEnvelopes must be used within an EnvelopesProvider');
  }
  return context;
}
