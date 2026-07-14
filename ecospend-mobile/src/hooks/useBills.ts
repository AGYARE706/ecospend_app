import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import * as billsApi from '../api/billsApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useWallet } from '../context/WalletContext';
import type { Bill } from '../api/billsApi';

/** Recurring bills paid from the wallet. */
export function useBills() {
  const { isAuthenticated } = useAuth();
  const { balance, refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const refreshBills = useCallback(async () => {
    if (!isAuthenticated) {
      setBills([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setBills(await billsApi.listBills());
    } catch (error) {
      console.warn('Failed to load bills', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshBills();
  }, [refreshBills]);

  const payBill = useCallback(
    async (bill: Bill) => {
      setPayingId(bill.id);
      try {
        const updated = await billsApi.payBill(bill.id);
        setBills((current) =>
          current.map((item) => (item.id === bill.id ? updated : item)),
        );
        void refreshWallet();
        void refreshTransactions();
        Alert.alert(
          'Bill paid',
          `GHS ${bill.amount.toFixed(2)} paid for ${bill.name} from your wallet.`,
        );
      } catch (error) {
        Alert.alert(
          'Payment failed',
          getApiErrorMessage(error, 'Could not pay this bill'),
        );
      } finally {
        setPayingId(null);
      }
    },
    [refreshTransactions, refreshWallet],
  );

  const removeBill = useCallback(async (bill: Bill) => {
    try {
      await billsApi.deleteBill(bill.id);
      setBills((current) => current.filter((item) => item.id !== bill.id));
    } catch (error) {
      Alert.alert(
        'Could not delete',
        getApiErrorMessage(error, 'Could not delete this bill'),
      );
    }
  }, []);

  return {
    bills,
    loading,
    payingId,
    walletBalance: balance ?? 0,
    refreshBills,
    payBill,
    removeBill,
  };
}
