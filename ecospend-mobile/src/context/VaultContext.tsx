import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getApiErrorCode, getApiErrorMessage } from '../api/getApiErrorMessage';
import * as groupVaultApi from '../api/groupVaultApi';
import * as paymentsApi from '../api/paymentsApi';
import * as vaultApi from '../api/vaultApi';
import { useAuth } from './AuthContext';
import { buildGroupVaultSummary } from '../data/mock/groupVaults';
import { buildVaultSummary } from '../data/mock/vaults';
import type {
  GroupVault,
  WithdrawalRequest,
} from '../types/groupVault';
import type { Vault } from '../types/vault';

export interface CreateVaultPayload {
  name: string;
  targetAmount: number;
  initialDeposit: number;
  maturityDate: string;
}

export interface CreateGroupVaultPayload {
  name: string;
  goalName: string;
  targetAmount: number;
  maturityDate: string;
  memberLimit: number;
  members: Array<{ phone: string; displayPhone: string }>;
}

interface VaultContextValue {
  vaults: Vault[];
  groupVaults: GroupVault[];
  withdrawalRequests: WithdrawalRequest[];
  loading: boolean;
  lastError: string | null;
  lastErrorCode: string | null;
  clearError: () => void;
  refreshVaults: () => Promise<void>;
  getVaultById: (id: string) => Vault | undefined;
  getGroupVaultById: (id: string) => GroupVault | undefined;
  getWithdrawalRequestById: (id: string) => WithdrawalRequest | undefined;
  createVault: (payload: CreateVaultPayload) => Promise<Vault>;
  /** Starts a Paystack checkout for the amount; balance is credited only after verification. */
  startPaystackDeposit: (
    vaultId: string,
    amount: number,
  ) => Promise<paymentsApi.DepositView>;
  /** Polls/asks Paystack to verify; refreshes the vault when the deposit settles. */
  verifyPaystackDeposit: (reference: string) => Promise<paymentsApi.DepositView>;
  withdrawVault: (
    vaultId: string,
    amountReceived: number,
    feeCharged: number,
    mode?: 'matured' | 'early',
    destination?: vaultApi.PayoutDestination,
  ) => Promise<void>;
  createGroupVault: (payload: CreateGroupVaultPayload) => Promise<GroupVault>;
  joinGroupVault: (inviteCode: string) => Promise<GroupVault | null>;
  voteWithdrawal: (requestId: string, approve: boolean) => Promise<void>;
  lookupInviteCode: (code: string) => Promise<GroupVault | null>;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [groupVaults, setGroupVaults] = useState<GroupVault[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setLastError(null);
    setLastErrorCode(null);
  }, []);

  const refreshVaults = useCallback(async () => {
    if (!isAuthenticated) {
      setVaults([]);
      setGroupVaults([]);
      setWithdrawalRequests([]);
      return;
    }

    setLoading(true);
    try {
      const personal = await vaultApi.listVaults();
      setVaults(personal);

      try {
        const groups = await groupVaultApi.listGroupVaults();
        setGroupVaults(groups);

        const withdrawals = (
          await Promise.all(
            groups.map(async (group) => {
              try {
                const list = await groupVaultApi.listWithdrawals(group.id);
                return list.map((item) => ({
                  ...item,
                  groupVaultName: group.name,
                }));
              } catch {
                return [] as WithdrawalRequest[];
              }
            }),
          )
        ).flat();
        setWithdrawalRequests(withdrawals);
      } catch (error) {
        const code = getApiErrorCode(error);
        if (code === 'GROUP_VAULT_REQUIRES_PLUS') {
          setGroupVaults([]);
          setWithdrawalRequests([]);
        } else {
          console.warn('Failed to load group vaults', getApiErrorMessage(error));
        }
      }
    } catch (error) {
      setLastError(getApiErrorMessage(error, 'Could not load vaults'));
      setLastErrorCode(getApiErrorCode(error) ?? null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshVaults();
  }, [refreshVaults]);

  const getVaultById = useCallback(
    (id: string) => vaults.find((vault) => vault.id === id),
    [vaults],
  );

  const getGroupVaultById = useCallback(
    (id: string) => groupVaults.find((vault) => vault.id === id),
    [groupVaults],
  );

  const getWithdrawalRequestById = useCallback(
    (id: string) => withdrawalRequests.find((request) => request.id === id),
    [withdrawalRequests],
  );

  const createVault = useCallback(
    async (payload: CreateVaultPayload): Promise<Vault> => {
      clearError();
      try {
        let created = await vaultApi.createVault({
          name: payload.name.trim(),
          targetAmount: payload.targetAmount,
          lockedUntil: payload.maturityDate,
        });

        if (payload.initialDeposit > 0) {
          created = await vaultApi.depositToVault(
            created.id,
            payload.initialDeposit,
            'Initial deposit',
          );
        }

        setVaults((current) => [created, ...current]);
        return created;
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not create vault'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError],
  );

  const startPaystackDeposit = useCallback(
    async (vaultId: string, amount: number) => {
      clearError();
      try {
        return await paymentsApi.initializeDeposit({
          vaultId,
          amount,
          phone: user?.phone,
        });
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not start deposit'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError, user?.phone],
  );

  const verifyPaystackDeposit = useCallback(
    async (reference: string) => {
      const deposit = await paymentsApi.verifyDeposit(reference);
      if (deposit.status === 'SUCCESS') {
        // Balance was credited server-side — reload so the UI reflects it.
        await refreshVaults();
      }
      return deposit;
    },
    [refreshVaults],
  );

  const withdrawVault = useCallback(
    async (
      vaultId: string,
      _amountReceived: number,
      feeCharged: number,
      mode: 'matured' | 'early' = 'matured',
      destination?: vaultApi.PayoutDestination,
    ) => {
      clearError();
      try {
        const vault = vaults.find((item) => item.id === vaultId);
        if (!vault) {
          throw new Error('Vault not found');
        }

        const updated =
          mode === 'early'
            ? await vaultApi.breakVault(vaultId, destination)
            : await vaultApi.withdrawFromVault(
                vaultId,
                vault.currentBalance,
                destination,
              );

        setVaults((current) =>
          current.map((item) =>
            item.id === vaultId
              ? {
                  ...updated,
                  status: 'withdrawn',
                  currentBalance: 0,
                  feeCharged,
                  withdrawalDate: new Date().toISOString().slice(0, 10),
                }
              : item,
          ),
        );
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not withdraw'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError, vaults],
  );

  const createGroupVault = useCallback(
    async (payload: CreateGroupVaultPayload): Promise<GroupVault> => {
      clearError();
      try {
        const created = await groupVaultApi.createGroupVault({
          name: payload.name.trim() || payload.goalName.trim(),
          targetAmount: payload.targetAmount,
          lockedUntil: payload.maturityDate,
          maxMembers: payload.memberLimit,
        });
        setGroupVaults((current) => [created, ...current]);
        return created;
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not create group vault'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError],
  );

  const lookupInviteCode = useCallback(
    async (code: string): Promise<GroupVault | null> => {
      clearError();
      try {
        return await groupVaultApi.previewGroupByCode(code.trim());
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Invite code not found'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        return null;
      }
    },
    [clearError],
  );

  const joinGroupVault = useCallback(
    async (inviteCode: string): Promise<GroupVault | null> => {
      clearError();
      try {
        const joined = await groupVaultApi.joinGroupByCode(inviteCode.trim());
        setGroupVaults((current) => {
          const exists = current.some((vault) => vault.id === joined.id);
          return exists
            ? current.map((vault) => (vault.id === joined.id ? joined : vault))
            : [joined, ...current];
        });
        return joined;
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not join group vault'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        return null;
      }
    },
    [clearError],
  );

  const voteWithdrawal = useCallback(
    async (requestId: string, approve: boolean) => {
      clearError();
      const existing = withdrawalRequests.find((item) => item.id === requestId);
      if (!existing) {
        return;
      }

      try {
        const updated = await groupVaultApi.voteWithdrawal(
          existing.groupVaultId,
          requestId,
          approve,
        );
        setWithdrawalRequests((current) =>
          current.map((item) =>
            item.id === requestId
              ? { ...updated, groupVaultName: existing.groupVaultName }
              : item,
          ),
        );
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not submit vote'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError, withdrawalRequests],
  );

  const value = useMemo(
    () => ({
      vaults,
      groupVaults,
      withdrawalRequests,
      loading,
      lastError,
      lastErrorCode,
      clearError,
      refreshVaults,
      getVaultById,
      getGroupVaultById,
      getWithdrawalRequestById,
      createVault,
      startPaystackDeposit,
      verifyPaystackDeposit,
      withdrawVault,
      createGroupVault,
      joinGroupVault,
      voteWithdrawal,
      lookupInviteCode,
    }),
    [
      clearError,
      createGroupVault,
      createVault,
      getGroupVaultById,
      getVaultById,
      getWithdrawalRequestById,
      groupVaults,
      joinGroupVault,
      lastError,
      lastErrorCode,
      loading,
      lookupInviteCode,
      refreshVaults,
      startPaystackDeposit,
      vaults,
      verifyPaystackDeposit,
      voteWithdrawal,
      withdrawVault,
      withdrawalRequests,
    ],
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

export function useVaults(): VaultContextValue {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVaults must be used within a VaultProvider');
  }
  return context;
}

export function useVaultSummary() {
  const { vaults } = useVaults();
  return useMemo(() => buildVaultSummary(vaults), [vaults]);
}

export function useGroupVaultSummary() {
  const { groupVaults, withdrawalRequests } = useVaults();
  return useMemo(
    () => buildGroupVaultSummary(groupVaults, withdrawalRequests),
    [groupVaults, withdrawalRequests],
  );
}
