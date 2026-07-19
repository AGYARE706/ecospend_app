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
import { toCanonicalGhanaPhone } from '../utils/validation';
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
  /** WEEKLY | MONTHLY — cadence of the automatic contribution plan. */
  contributionFrequency: string;
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
  depositFromWallet: (vaultId: string, amount: number) => Promise<Vault>;
  contributeToGroup: (groupId: string, amount: number) => Promise<GroupVault>;
  withdrawVault: (
    vaultId: string,
    amountReceived: number,
    feeCharged: number,
    mode?: 'matured' | 'early',
  ) => Promise<void>;
  createGroupVault: (payload: CreateGroupVaultPayload) => Promise<GroupVault>;
  joinGroupVault: (inviteCode: string) => Promise<GroupVault | null>;
  requestWithdrawal: (groupId: string, amount: number, note?: string) => Promise<WithdrawalRequest>;
  voteWithdrawal: (requestId: string, approve: boolean) => Promise<void>;
  lookupInviteCode: (code: string) => Promise<GroupVault | null>;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
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
          // Initial deposit is real money moved from the central wallet.
          // If the wallet can't cover it, the vault still exists — the
          // user just funds it later from the vault screen.
          try {
            await paymentsApi.transferToVault(created.id, payload.initialDeposit);
            created = await vaultApi.getVault(created.id);
          } catch (error) {
            setLastError(
              getApiErrorMessage(
                error,
                'Vault created, but the initial deposit could not be made',
              ),
            );
            setLastErrorCode(getApiErrorCode(error) ?? null);
          }
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

  const depositFromWallet = useCallback(
    async (vaultId: string, amount: number): Promise<Vault> => {
      clearError();
      try {
        await paymentsApi.transferToVault(vaultId, amount);
        const updated = await vaultApi.getVault(vaultId);
        setVaults((current) =>
          current.map((item) => (item.id === vaultId ? updated : item)),
        );
        return updated;
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not deposit from wallet'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError],
  );

  const contributeToGroup = useCallback(
    async (groupId: string, amount: number): Promise<GroupVault> => {
      clearError();
      try {
        await paymentsApi.transferToGroup(groupId, amount);
        const updated = await groupVaultApi.getGroupVault(groupId);
        setGroupVaults((current) =>
          current.map((item) => (item.id === groupId ? updated : item)),
        );
        return updated;
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not contribute from wallet'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError],
  );

  const withdrawVault = useCallback(
    async (
      vaultId: string,
      _amountReceived: number,
      feeCharged: number,
      mode: 'matured' | 'early' = 'matured',
    ) => {
      clearError();
      try {
        const vault = vaults.find((item) => item.id === vaultId);
        if (!vault) {
          throw new Error('Vault not found');
        }

        const updated =
          mode === 'early'
            ? await vaultApi.breakVault(vaultId)
            : await vaultApi.withdrawFromVault(vaultId, vault.currentBalance);

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
          contributionFrequency: payload.contributionFrequency,
          memberPhones: payload.members.map((member) => toCanonicalGhanaPhone(member.phone)),
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

  const requestWithdrawal = useCallback(
    async (groupId: string, amount: number, note?: string): Promise<WithdrawalRequest> => {
      clearError();
      try {
        const group = groupVaults.find((g) => g.id === groupId);
        const created = await groupVaultApi.requestWithdrawal(groupId, amount, note);
        const withName: WithdrawalRequest = {
          ...created,
          groupVaultName: group?.name ?? created.groupVaultName,
        };
        setWithdrawalRequests((current) => [withName, ...current]);
        return withName;
      } catch (error) {
        setLastError(getApiErrorMessage(error, 'Could not request a withdrawal'));
        setLastErrorCode(getApiErrorCode(error) ?? null);
        throw error;
      }
    },
    [clearError, groupVaults],
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
      depositFromWallet,
      contributeToGroup,
      withdrawVault,
      createGroupVault,
      joinGroupVault,
      requestWithdrawal,
      voteWithdrawal,
      lookupInviteCode,
    }),
    [
      clearError,
      contributeToGroup,
      createGroupVault,
      createVault,
      depositFromWallet,
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
      requestWithdrawal,
      vaults,
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
