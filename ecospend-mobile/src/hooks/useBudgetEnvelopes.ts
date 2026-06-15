import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CATEGORY_CONFIG } from '../constants/categories';
import {
  MOCK_ENVELOPE_SAVE_DELAY_MS,
  MOCK_LOADING_DELAY_MS,
  mockEnvelopes,
} from '../data/mock/mockData';
import type {
  AddEnvelopePayload,
  EditEnvelopePayload,
  Envelope,
  EnvelopeFilter,
} from '../types';
import {
  countByStatus,
  filterEnvelopes,
  formatMonthYear,
  hasCategoryThisMonth,
} from '../utils/envelopes';

const TOAST_DURATION_MS = 2000;

function createEnvelopeId(): string {
  return `env-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const ENVELOPE_COLORS: Envelope['color'][] = [
  'primaryBackground',
  'blueLight',
  'warningLight',
  'successLight',
  'errorLight',
];

/**
 * Manages monthly budget envelope state, filtering, totals, and mock add/edit.
 */
export function useBudgetEnvelopes() {
  const [allEnvelopes, setAllEnvelopes] = useState<Envelope[]>(mockEnvelopes);
  const [activeFilter, setFilter] = useState<EnvelopeFilter>('All');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

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

  const addEnvelope = useCallback(
    async (payload: AddEnvelopePayload): Promise<boolean> => {
      setIsSaving(true);

      await new Promise((resolve) =>
        setTimeout(resolve, MOCK_ENVELOPE_SAVE_DELAY_MS),
      );

      const categoryConfig = CATEGORY_CONFIG[payload.category];
      const color = ENVELOPE_COLORS[allEnvelopes.length % ENVELOPE_COLORS.length];

      const nextEnvelope: Envelope = {
        id: createEnvelopeId(),
        category: payload.category,
        emoji: categoryConfig.emoji,
        monthlyLimit: payload.monthlyLimit,
        currentSpend: 0,
        month: currentMonth,
        year: currentYear,
        color,
      };

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

      setIsSaving(false);
      showToast(`${payload.category} envelope set to GHS ${payload.monthlyLimit.toFixed(2)}`);
      return true;
    },
    [allEnvelopes.length, currentMonth, currentYear, showToast],
  );

  const editEnvelope = useCallback(
    async (payload: EditEnvelopePayload): Promise<boolean> => {
      setIsSaving(true);

      await new Promise((resolve) =>
        setTimeout(resolve, MOCK_ENVELOPE_SAVE_DELAY_MS),
      );

      let categoryLabel = 'Envelope';

      setAllEnvelopes((current) =>
        current.map((envelope) => {
          if (envelope.id !== payload.id) {
            return envelope;
          }

          categoryLabel = envelope.category;
          return {
            ...envelope,
            monthlyLimit: payload.monthlyLimit,
          };
        }),
      );

      setIsSaving(false);
      showToast(`${categoryLabel} limit updated to GHS ${payload.monthlyLimit.toFixed(2)}`);
      return true;
    },
    [showToast],
  );

  return {
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
    toastMessage,
    clearToast,
    isSaving,
    hasCategoryThisMonth: (category: AddEnvelopePayload['category']) =>
      hasCategoryThisMonth(allEnvelopes, category, currentMonth, currentYear),
  };
}
