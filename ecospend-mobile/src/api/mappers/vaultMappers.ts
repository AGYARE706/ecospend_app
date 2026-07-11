import type { GroupVault, GroupVaultMember, WithdrawalRequest } from '../../types/groupVault';
import type { Vault, VaultContribution, VaultStatus } from '../../types/vault';

const ACCENT_COLORS = [
  '#2E7D32',
  '#1565C0',
  '#6A1B9A',
  '#E65100',
  '#0277BD',
  '#37474F',
];

interface ApiVault {
  id: string;
  name: string;
  balance?: number | string;
  currentBalance?: number | string;
  targetAmount?: number | string | null;
  lockedUntil?: string;
  maturityDate?: string;
  status?: string;
  createdAt?: string;
  createdDate?: string;
  withdrawalFeeGhs?: number | string;
  earlyExitFeeGhs?: number | string;
  daysToMaturity?: number;
}

interface ApiVaultTx {
  id: string;
  amount: number | string;
  note?: string | null;
  createdAt?: string;
  type?: string;
}

function pickAccent(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % ACCENT_COLORS.length;
  }
  return ACCENT_COLORS[hash] ?? ACCENT_COLORS[0];
}

function mapVaultStatus(dto: ApiVault): VaultStatus {
  const status = (dto.status ?? 'ACTIVE').toUpperCase();
  if (status === 'BROKEN' || status === 'CLOSED') {
    return 'withdrawn';
  }

  const maturity = dto.maturityDate ?? dto.lockedUntil;
  if (maturity) {
    const days =
      dto.daysToMaturity ??
      Math.ceil(
        (new Date(maturity).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
    if (days <= 0) {
      return 'matured';
    }
  }

  return 'active';
}

export function mapVault(dto: ApiVault, contributions: VaultContribution[] = []): Vault {
  const balance = Number(dto.currentBalance ?? dto.balance ?? 0);
  return {
    id: String(dto.id),
    name: dto.name,
    currentBalance: balance,
    targetAmount: Number(dto.targetAmount ?? 0),
    maturityDate: dto.maturityDate ?? dto.lockedUntil ?? '',
    createdDate:
      dto.createdDate ??
      (dto.createdAt ? dto.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
    estimatedWithdrawalFee: Number(dto.withdrawalFeeGhs ?? balance * 0.02),
    status: mapVaultStatus(dto),
    accentColor: pickAccent(String(dto.id)),
    contributions,
  };
}

export function mapVaultContribution(dto: ApiVaultTx): VaultContribution {
  return {
    id: String(dto.id),
    date: dto.createdAt ? dto.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    amount: Number(dto.amount),
    note: dto.note ?? undefined,
  };
}

interface ApiGroupMember {
  id?: string;
  userId?: string;
  balance?: number | string;
  status?: string;
  role?: string;
  joinedAt?: string;
}

interface ApiGroup {
  id: string;
  name: string;
  targetAmount?: number | string | null;
  lockedUntil?: string;
  maturityDate?: string;
  status?: string;
  createdAt?: string;
  inviteCode?: string;
  maxMembers?: number;
}

interface ApiGroupVaultView {
  group: ApiGroup;
  members?: ApiGroupMember[];
  amountSaved?: number | string;
  myContribution?: number | string;
  inviteCode?: string;
}

function initialsFromId(id: string): string {
  return id.replace(/-/g, '').slice(0, 2).toUpperCase() || 'MB';
}

export function mapGroupVault(dto: ApiGroupVaultView, currentUserId?: string): GroupVault {
  const group = dto.group;
  const members: GroupVaultMember[] = (dto.members ?? []).map((member, index) => {
    const id = String(member.userId ?? member.id ?? `m-${index}`);
    const isCreator = currentUserId != null && id === currentUserId;
    return {
      id,
      name: isCreator ? 'You' : `Member ${index + 1}`,
      initials: isCreator ? 'YO' : initialsFromId(id),
      role: index === 0 || isCreator ? 'admin' : 'member',
      lastContribution: member.joinedAt?.slice(0, 10),
    };
  });

  const statusRaw = (group.status ?? 'ACTIVE').toUpperCase();
  const maturity = group.maturityDate ?? group.lockedUntil ?? '';
  let status: GroupVault['status'] = 'active';
  if (statusRaw === 'CLOSED') {
    status = 'closed';
  } else if (maturity && new Date(maturity).getTime() <= Date.now()) {
    status = 'matured';
  }

  return {
    id: String(group.id),
    name: group.name,
    goalName: group.name,
    description: `Group savings — invite ${group.inviteCode ?? dto.inviteCode ?? ''}`.trim(),
    amountSaved: Number(dto.amountSaved ?? 0),
    targetAmount: Number(group.targetAmount ?? 0),
    maturityDate: maturity,
    createdDate: group.createdAt
      ? group.createdAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status,
    accentColor: pickAccent(String(group.id)),
    members,
    myContribution: Number(dto.myContribution ?? 0),
    inviteCode: group.inviteCode ?? dto.inviteCode,
  };
}

interface ApiWithdrawalView {
  request: {
    id: string;
    groupId: string;
    requesterId: string;
    amount: number | string;
    reason?: string | null;
    status?: string;
    createdAt?: string;
  };
  approvals: number;
  rejections: number;
  activeMembers: number;
  approvalsNeeded: number;
  hasVoted: boolean;
}

export function mapWithdrawalRequest(
  dto: ApiWithdrawalView,
  groupName: string,
): WithdrawalRequest {
  const statusRaw = (dto.request.status ?? 'PENDING').toUpperCase();
  const status =
    statusRaw === 'APPROVED'
      ? 'approved'
      : statusRaw === 'REJECTED'
        ? 'rejected'
        : 'pending';

  return {
    id: String(dto.request.id),
    groupVaultId: String(dto.request.groupId),
    groupVaultName: groupName,
    requestedBy: {
      id: String(dto.request.requesterId),
      name: 'Member',
      initials: initialsFromId(String(dto.request.requesterId)),
      role: 'member',
    },
    amount: Number(dto.request.amount),
    reason: dto.request.reason ?? '',
    requestedDate: dto.request.createdAt
      ? dto.request.createdAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    votesFor: dto.approvals,
    votesAgainst: dto.rejections,
    requiredVotes: dto.approvalsNeeded,
    status,
    hasVoted: dto.hasVoted,
  };
}
