// ─── Status ───────────────────────────────────────────────────────────────────
export type GroupVaultStatus = 'active' | 'locked' | 'matured' | 'closed';
export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected';
export type MemberRole = 'admin' | 'member';

// ─── Member ───────────────────────────────────────────────────────────────────
export interface GroupVaultMember {
  id: string;
  name: string;
  initials: string;
  role: MemberRole;
  /** ISO date of last contribution */
  lastContribution?: string;
}

// ─── Withdrawal request ───────────────────────────────────────────────────────
export interface WithdrawalRequest {
  id: string;
  groupVaultId: string;
  groupVaultName: string;
  requestedBy: GroupVaultMember;
  amount: number;
  reason: string;
  requestedDate: string;
  votesFor: number;
  votesAgainst: number;
  requiredVotes: number;
  status: WithdrawalRequestStatus;
  /** Has the current user already voted? */
  hasVoted: boolean;
}

// ─── Group vault ──────────────────────────────────────────────────────────────
export interface GroupVault {
  id: string;
  name: string;
  goalName: string;
  description: string;
  amountSaved: number;
  targetAmount: number;
  maturityDate: string;
  createdDate: string;
  status: GroupVaultStatus;
  accentColor: string;
  members: GroupVaultMember[];
  /** Contributions made by the current user */
  myContribution: number;
}

// ─── Dashboard summary ────────────────────────────────────────────────────────
export interface GroupVaultSummary {
  totalGroupSavings: number;
  activeGroups: number;
  pendingApprovals: number;
}
