import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  buildGroupVaultSummary,
  mockGroupVaults,
  mockWithdrawalRequests,
} from '../data/mock/groupVaults';
import { buildVaultSummary, mockVaults } from '../data/mock/vaults';
import type {
  GroupVault,
  GroupVaultMember,
  WithdrawalRequest,
} from '../types/groupVault';
import type { Vault } from '../types/vault';

const ACCENT_COLORS = [
  '#2E7D32',
  '#1565C0',
  '#6A1B9A',
  '#E65100',
  '#0277BD',
  '#37474F',
];

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
  getVaultById: (id: string) => Vault | undefined;
  getGroupVaultById: (id: string) => GroupVault | undefined;
  getWithdrawalRequestById: (id: string) => WithdrawalRequest | undefined;
  createVault: (payload: CreateVaultPayload) => Vault;
  withdrawVault: (
    vaultId: string,
    amountReceived: number,
    feeCharged: number,
  ) => void;
  createGroupVault: (payload: CreateGroupVaultPayload) => GroupVault;
  joinGroupVault: (inviteCode: string) => GroupVault | null;
  voteWithdrawal: (requestId: string, approve: boolean) => void;
  lookupInviteCode: (code: string) => GroupVault | null;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

const INVITE_CODE_MAP: Record<string, string> = {
  'TRIP-2026': 'gv-trip',
  'TECH-TEAM': 'gv-office',
  'FAM-SAFE': 'gv-family',
  'STRT-PAD': 'gv-startup',
};

function createVaultId(): string {
  return `vault-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createGroupVaultId(): string {
  return `gv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function initialsFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-4);
  return digits.slice(0, 2).toUpperCase() || 'MB';
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>(mockVaults);
  const [groupVaults, setGroupVaults] = useState<GroupVault[]>(mockGroupVaults);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >(mockWithdrawalRequests);

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

  const createVault = useCallback((payload: CreateVaultPayload): Vault => {
    const deposit = Math.max(0, payload.initialDeposit);
    const created: Vault = {
      id: createVaultId(),
      name: payload.name.trim(),
      currentBalance: deposit,
      targetAmount: payload.targetAmount,
      maturityDate: payload.maturityDate,
      createdDate: new Date().toISOString().slice(0, 10),
      estimatedWithdrawalFee: Math.round(deposit * 0.02 * 100) / 100,
      status: 'active',
      accentColor: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)],
      contributions:
        deposit > 0
          ? [
              {
                id: `c-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                amount: deposit,
                note: 'Initial deposit',
              },
            ]
          : [],
    };

    setVaults((current) => [created, ...current]);
    return created;
  }, []);

  const withdrawVault = useCallback(
    (vaultId: string, amountReceived: number, feeCharged: number) => {
      setVaults((current) =>
        current.map((vault) => {
          if (vault.id !== vaultId) {
            return vault;
          }

          return {
            ...vault,
            currentBalance: 0,
            status: 'withdrawn',
            withdrawalDate: new Date().toISOString().slice(0, 10),
            feeCharged,
            estimatedWithdrawalFee: 0,
          };
        }),
      );
      void amountReceived;
    },
    [],
  );

  const createGroupVault = useCallback(
    (payload: CreateGroupVaultPayload): GroupVault => {
      const me: GroupVaultMember = {
        id: 'm-self',
        name: 'Frank Mensah',
        initials: 'FM',
        role: 'admin',
        lastContribution: new Date().toISOString().slice(0, 10),
      };

      const invited: GroupVaultMember[] = payload.members.map((member, index) => ({
        id: `m-invite-${Date.now()}-${index}`,
        name: member.displayPhone,
        initials: initialsFromPhone(member.phone),
        role: 'member',
      }));

      const created: GroupVault = {
        id: createGroupVaultId(),
        name: payload.name.trim(),
        goalName: payload.goalName.trim(),
        description: `Group savings toward ${payload.goalName.trim()}`,
        amountSaved: 0,
        targetAmount: payload.targetAmount,
        maturityDate: payload.maturityDate,
        createdDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        accentColor:
          ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)],
        myContribution: 0,
        members: [me, ...invited],
      };

      setGroupVaults((current) => [created, ...current]);
      return created;
    },
    [],
  );

  const lookupInviteCode = useCallback(
    (code: string): GroupVault | null => {
      const normalized = code.trim().toUpperCase();
      const mappedId = INVITE_CODE_MAP[normalized];
      if (mappedId) {
        return groupVaults.find((vault) => vault.id === mappedId) ?? null;
      }

      return (
        groupVaults.find(
          (vault) =>
            vault.name.toUpperCase().replace(/\s+/g, '-').includes(normalized) ||
            vault.id.toUpperCase() === normalized,
        ) ?? null
      );
    },
    [groupVaults],
  );

  const joinGroupVault = useCallback(
    (inviteCode: string): GroupVault | null => {
      const found = lookupInviteCode(inviteCode);
      if (!found) {
        return null;
      }

      const alreadyMember = found.members.some((member) => member.id === 'm-self');
      if (alreadyMember) {
        return found;
      }

      const me: GroupVaultMember = {
        id: 'm-self',
        name: 'Frank Mensah',
        initials: 'FM',
        role: 'member',
        lastContribution: undefined,
      };

      const updated: GroupVault = {
        ...found,
        members: [...found.members, me],
      };

      setGroupVaults((current) =>
        current.map((vault) => (vault.id === found.id ? updated : vault)),
      );

      return updated;
    },
    [lookupInviteCode],
  );

  const voteWithdrawal = useCallback((requestId: string, approve: boolean) => {
    setWithdrawalRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId || request.hasVoted) {
          return request;
        }

        const votesFor = approve ? request.votesFor + 1 : request.votesFor;
        const votesAgainst = approve
          ? request.votesAgainst
          : request.votesAgainst + 1;
        const approved = votesFor >= request.requiredVotes;
        const rejected =
          votesAgainst > request.requiredVotes - request.votesFor &&
          votesAgainst >= Math.ceil(request.requiredVotes / 2);

        return {
          ...request,
          votesFor,
          votesAgainst,
          hasVoted: true,
          status: approved ? 'approved' : rejected ? 'rejected' : 'pending',
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      vaults,
      groupVaults,
      withdrawalRequests,
      getVaultById,
      getGroupVaultById,
      getWithdrawalRequestById,
      createVault,
      withdrawVault,
      createGroupVault,
      joinGroupVault,
      voteWithdrawal,
      lookupInviteCode,
    }),
    [
      createGroupVault,
      createVault,
      getGroupVaultById,
      getVaultById,
      getWithdrawalRequestById,
      groupVaults,
      joinGroupVault,
      lookupInviteCode,
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
