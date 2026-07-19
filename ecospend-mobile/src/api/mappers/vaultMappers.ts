import type {
  GroupVault,
  GroupVaultActivityType,
  GroupVaultMember,
  WithdrawalRequest,
} from '../../types/groupVault';
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
  creatorId?: string;
  targetAmount?: number | string | null;
  lockedUntil?: string;
  maturityDate?: string;
  status?: string;
  createdAt?: string;
  inviteCode?: string;
  maxMembers?: number;
  contributionFrequency?: string;
}

interface ApiPlanInstalment {
  index: number;
  dueDate: string;
  cumulativePerMember: number | string;
}

interface ApiContributionPlan {
  frequency?: string;
  memberShare?: number | string;
  instalmentAmount?: number | string;
  instalmentCount?: number;
  instalments?: ApiPlanInstalment[];
  nextDueDate?: string | null;
}

interface ApiMemberInstalment {
  index: number;
  dueDate: string;
  amountDue: number | string;
  paid: boolean;
  paidDate?: string | null;
}

interface ApiMemberPlan {
  userId: string;
  contributed?: number | string;
  expectedToDate?: number | string;
  memberShare?: number | string;
  status?: string;
  instalments?: ApiMemberInstalment[];
}

interface ApiInvite {
  id: string;
  phoneNumber: string;
  invitedUserId?: string | null;
  status?: string;
  createdAt?: string;
  joinedAt?: string | null;
}

interface ApiActivity {
  id: string;
  actorUserId?: string | null;
  type: string;
  message: string;
  amount?: number | string | null;
  createdAt?: string;
}

interface ApiGroupVaultView {
  group: ApiGroup;
  members?: ApiGroupMember[];
  amountSaved?: number | string;
  myContribution?: number | string;
  viewerId?: string | null;
  inviteCode?: string;
  contributionPlan?: ApiContributionPlan | null;
  memberPlans?: ApiMemberPlan[];
  invites?: ApiInvite[];
  activity?: ApiActivity[];
  /** Display name per member userId, resolved by the backend. Absent entries mean the name couldn't be resolved. */
  memberNames?: Record<string, string>;
}

function mapContributionPlan(
  raw: ApiContributionPlan | null | undefined,
): GroupVault['contributionPlan'] {
  if (!raw) {
    return undefined;
  }
  return {
    frequency: raw.frequency === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY',
    memberShare: Number(raw.memberShare ?? 0),
    instalmentAmount: Number(raw.instalmentAmount ?? 0),
    instalmentCount: raw.instalmentCount ?? raw.instalments?.length ?? 0,
    instalments: (raw.instalments ?? []).map((item) => ({
      index: item.index,
      dueDate: item.dueDate,
      cumulativePerMember: Number(item.cumulativePerMember ?? 0),
    })),
    nextDueDate: raw.nextDueDate ?? null,
  };
}

function initialsFromId(id: string): string {
  return id.replace(/-/g, '').slice(0, 2).toUpperCase() || 'MB';
}

/** Mirrors AvatarInitials.tsx's getInitials() so member avatars look consistent app-wide. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function mapGroupVault(dto: ApiGroupVaultView): GroupVault {
  const group = dto.group;
  const viewerId = dto.viewerId != null ? String(dto.viewerId) : undefined;
  const creatorId = group.creatorId != null ? String(group.creatorId) : undefined;

  const members: GroupVaultMember[] = (dto.members ?? []).map((member, index) => {
    const id = String(member.userId ?? member.id ?? `m-${index}`);
    const isMe = viewerId != null && id === viewerId;
    // Falls back to the first member (usual creation order) only if the
    // backend ever omits creatorId — normal responses always include it.
    const isAdmin = creatorId != null ? id === creatorId : index === 0;
    // The backend resolves real names via identity-service; "Member N" is
    // a last-resort fallback for the rare case that lookup comes back empty.
    const resolvedName = dto.memberNames?.[id];
    const name = isMe ? 'You' : (resolvedName ?? `Member ${index + 1}`);
    return {
      id,
      name,
      initials: isMe ? 'YO' : resolvedName ? initialsFromName(resolvedName) : initialsFromId(id),
      role: isAdmin ? 'admin' : 'member',
      isMe,
      lastContribution: member.joinedAt?.slice(0, 10),
      contributed: Number(member.balance ?? 0),
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
    creatorId,
    contributionFrequency:
      group.contributionFrequency === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY',
    contributionPlan: mapContributionPlan(dto.contributionPlan),
    memberPlans: (dto.memberPlans ?? []).map((plan) => ({
      userId: String(plan.userId),
      contributed: Number(plan.contributed ?? 0),
      expectedToDate: Number(plan.expectedToDate ?? 0),
      memberShare: Number(plan.memberShare ?? 0),
      status:
        plan.status === 'COMPLETED' || plan.status === 'BEHIND'
          ? plan.status
          : 'ON_TRACK',
      instalments: (plan.instalments ?? []).map((item) => ({
        index: item.index,
        dueDate: item.dueDate,
        amountDue: Number(item.amountDue ?? 0),
        paid: Boolean(item.paid),
        paidDate: item.paidDate ?? undefined,
      })),
    })),
    invites: (dto.invites ?? []).map((invite) => ({
      id: String(invite.id),
      phoneNumber: invite.phoneNumber,
      invitedUserId: invite.invitedUserId != null ? String(invite.invitedUserId) : undefined,
      status: invite.status === 'JOINED' ? 'JOINED' : 'PENDING',
      createdAt: invite.createdAt ?? '',
      joinedAt: invite.joinedAt ?? undefined,
    })),
    activity: (dto.activity ?? []).map((entry) => ({
      id: String(entry.id),
      actorUserId: entry.actorUserId != null ? String(entry.actorUserId) : undefined,
      type: entry.type as GroupVaultActivityType,
      message: entry.message,
      amount: entry.amount != null ? Number(entry.amount) : undefined,
      createdAt: entry.createdAt ?? '',
    })),
  };
}

interface ApiWithdrawalView {
  request: {
    id: string;
    groupId: string;
    requesterId: string;
    amount: number | string;
    note?: string | null;
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
    statusRaw === 'EXECUTED'
      ? 'executed'
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
    reason: dto.request.note ?? '',
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
