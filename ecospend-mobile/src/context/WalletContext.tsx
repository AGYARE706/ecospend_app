import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as paymentsApi from '../api/paymentsApi';
import { useAuth } from './AuthContext';

/**
 * The central wallet: the one real app-level balance. Money comes in via
 * Paystack top-ups and leaves via MoMo sends; vault/goal/group/bill
 * operations move money between the wallet and those products.
 */
interface WalletContextValue {
  balance: number | null;
  loading: boolean;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(null);
      return;
    }

    setLoading(true);
    try {
      const wallet = await paymentsApi.getWallet();
      setBalance(Number(wallet.balance));
    } catch (error) {
      console.warn('Failed to load wallet', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  const value = useMemo(
    () => ({ balance, loading, refreshWallet }),
    [balance, loading, refreshWallet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
