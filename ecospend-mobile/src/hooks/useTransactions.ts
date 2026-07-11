import { useEffect, useMemo, useState } from 'react';

import { useFinance } from '../context/FinanceContext';
import { MOCK_LOADING_DELAY_MS } from '../data/mock/mockData';
import type { GroupedTransactions, TransactionFilter, TransactionSummaryBar } from '../types';
import {
  computeSummary,
  filterTransactions,
  groupTransactionsByDate,
} from '../utils/transactions';

export function useTransactions() {
  const { transactions } = useFinance();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setFilter] = useState<TransactionFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), MOCK_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, activeFilter, searchQuery),
    [activeFilter, searchQuery, transactions],
  );

  const groupedTransactions = useMemo(
    (): GroupedTransactions[] => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions],
  );

  const summary = useMemo(
    (): TransactionSummaryBar => computeSummary(filteredTransactions),
    [filteredTransactions],
  );

  const isEmpty = !loading && filteredTransactions.length === 0;

  return {
    groupedTransactions,
    activeFilter,
    setFilter,
    searchQuery,
    setSearchQuery,
    summary,
    loading,
    isEmpty,
  };
}
