import type {
  AppNotification,
  NotificationAction,
  NotificationType,
} from '../../types/notification';

interface ApiNotification {
  id: string;
  title: string;
  body: string;
  type?: string;
  /** The backend deserializes the stored JSON before responding — this is already an object, not a string. */
  data?: Record<string, unknown> | null;
  read?: boolean;
  createdAt: string;
}

const EXACT_TYPES: Record<string, NotificationType> = {
  GROUP_VAULT_REMINDER: 'group_vault_reminder',
  GROUP_VAULT_INVITE: 'group_vault_invite',
  GROUP_VAULT_VOTE: 'group_vault_vote',
  GROUP_VAULT_WITHDRAWAL_UPDATE: 'group_vault_withdrawal_update',
  GROUP_VAULT_ACTIVITY: 'group_vault_activity',
  VAULT_MATURED: 'vault_matured',
  GOAL_COMPLETED: 'goal_completed',
  BUDGET_ALERT: 'budget_alert',
  PLUS_UPGRADE: 'plus_upgrade',
  WALLET_TOPUP: 'wallet_topup',
  WEEKLY_INSIGHT: 'weekly_insight',
  SPENDING_ANOMALY: 'spending_anomaly',
  BADGE_EARNED: 'badge_earned',
  STREAK_MILESTONE: 'streak_milestone',
  SYSTEM: 'system',
};

function mapType(type?: string): NotificationType {
  const value = (type ?? '').toUpperCase();

  const exact = EXACT_TYPES[value];
  if (exact) {
    return exact;
  }

  // Fallback heuristics for any type string outside the known taxonomy
  // above — never silently mislabels as something unrelated.
  if (value.includes('VAULT') && value.includes('VOTE')) {
    return 'group_vault_vote';
  }
  if (value.includes('VAULT') && value.includes('GROUP')) {
    return 'group_vault_activity';
  }
  if (value.includes('VAULT')) {
    return 'vault_matured';
  }
  if (value.includes('BUDGET') || value.includes('ENVELOPE')) {
    return 'budget_alert';
  }
  if (value.includes('GOAL')) {
    return 'goal_completed';
  }
  if (value.includes('WEEK') || value.includes('INSIGHT')) {
    return 'weekly_insight';
  }
  return 'system';
}

function mapAction(data?: Record<string, unknown> | null): NotificationAction {
  if (!data) {
    return { type: 'none' };
  }

  const str = (key: string): string | undefined => {
    const value = data[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  };

  const goalId = str('goalId');
  if (goalId) {
    return { type: 'goal_details', goalId };
  }
  const vaultId = str('vaultId');
  if (vaultId) {
    return { type: 'vault_details', vaultId };
  }
  const inviteCode = str('inviteCode');
  if (inviteCode) {
    return { type: 'join_group_vault', inviteCode };
  }
  const groupVaultId = str('groupVaultId');
  const requestId = str('requestId');
  if (groupVaultId && requestId) {
    return { type: 'withdrawal_approval', groupVaultId, requestId };
  }
  if (groupVaultId) {
    return { type: 'group_vault_details', groupVaultId };
  }
  if (str('category')) {
    return { type: 'budget_envelopes' };
  }
  const screen = str('screen');
  if (screen === 'BudgetEnvelopes') {
    return { type: 'budget_envelopes' };
  }
  if (screen === 'WeeklyInsights') {
    return { type: 'weekly_insights' };
  }
  if (screen === 'Subscription') {
    return { type: 'subscription' };
  }

  return { type: 'none' };
}

export function mapNotification(dto: ApiNotification): AppNotification {
  return {
    id: String(dto.id),
    type: mapType(dto.type),
    title: dto.title,
    message: dto.body,
    createdAt: dto.createdAt,
    read: Boolean(dto.read),
    action: mapAction(dto.data),
  };
}
