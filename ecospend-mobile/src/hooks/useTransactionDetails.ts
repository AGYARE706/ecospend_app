import { useMemo } from 'react';

import { useFinance } from '../context/FinanceContext';
import { getTransactionById } from '../utils/transactions';

export function useTransactionDetails(transactionId: string) {
  const { transactions } = useFinance();

  const transaction = useMemo(
    () => getTransactionById(transactions, transactionId),
    [transactionId, transactions],
  );

  return {
    transaction,
    isFound: transaction !== undefined,
  };
}
