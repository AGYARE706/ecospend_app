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
  /** True when this row is the signed-in user. */
  isMe?: boolean;
  /** ISO date of last contribution */
  lastContribution?: string;
  /** Total the member has contributed so far (absent on synthetic rows). */
  contributed?: number;
}

// ─── Contribution plan (auto-derived by the backend) ─────────────────────────
export type ContributionFrequency = 'WEEKLY' | 'MONTHLY';
export type MemberPlanState = 'ON_TRACK' | 'BEHIND' | 'COMPLETED';

export interface PlanInstalment {
  index: number;
  /** YYYY-MM-DD */
  dueDate: string;
  /** What each member should have contributed in total by this date. */
  cumulativePerMember: number;
}

/** One member's paid/unpaid state for a single instalment — the "ticked off" unit. */
export interface MemberInstalment {
  index: number;
  /** YYYY-MM-DD */
  dueDate: string;
  amountDue: number;
  paid: boolean;
  /** ISO date the member's balance first reached this instalment's threshold. */
  paidDate?: string;
}

/**
 * The automatic schedule: target ÷ planned members = each member's share,
 * split into equal instalments from creation until maturity.
 */
export interface ContributionPlan {
  frequency: ContributionFrequency;
  memberShare: number;
  instalmentAmount: number;
  instalmentCount: number;
  instalments: PlanInstalment[];
  nextDueDate: string | null;
}

export interface MemberPlanStatus {
  userId: string;
  contributed: number;
  expectedToDate: number;
  memberShare: number;
  status: MemberPlanState;
  /** Per-instalment breakdown so a member can see exactly which ones they've ticked off. */
  instalments: MemberInstalment[];
}

// ─── Invites (admin-only view) ─────────────────────────────────────────────────
export type GroupVaultInviteStatus = 'PENDING' | 'JOINED';

export interface GroupVaultInvite {
  id: string;
  phoneNumber: string;
  invitedUserId?: string;
  status: GroupVaultInviteStatus;
  createdAt: string;
  joinedAt?: string;
}

// ─── Activity log (real event history, distinct from the plan timeline) ───────
export type GroupVaultActivityType =
  | 'CREATED'
  | 'MEMBER_INVITED'
  | 'MEMBER_JOINED'
  | 'CONTRIBUTION'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_VOTE'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_EXECUTED'
  | 'MEMBER_EXITED';

export interface GroupVaultActivityEntry {
  id: string;
  actorUserId?: string;
  type: GroupVaultActivityType;
  message: string;
  amount?: number;
  createdAt: string;
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
  /** Invite code for join-by-code (when returned by API) */
  inviteCode?: string;
  /** The creator's user id — the only member who sees {@link invites}. */
  creatorId?: string;
  contributionFrequency?: ContributionFrequency;
  /** Present when the group has a target amount. */
  contributionPlan?: ContributionPlan;
  /** Per-member progress against the plan (empty without a plan). */
  memberPlans?: MemberPlanStatus[];
  /** Who was invited by phone and whether they've joined. Empty unless viewer is the creator. */
  invites?: GroupVaultInvite[];
  /** Full event history. Empty unless the viewer is an active member. */
  activity?: GroupVaultActivityEntry[];
}

// ─── Dashboard summary ────────────────────────────────────────────────────────
export interface GroupVaultSummary {
  totalGroupSavings: number;
  activeGroups: number;
  pendingApprovals: number;
}
