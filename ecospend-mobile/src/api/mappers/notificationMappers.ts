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
  data?: string | null;
  read?: boolean;
  createdAt: string;
}

function mapType(type?: string): NotificationType {
  const value = (type ?? '').toUpperCase();
  if (value.includes('VAULT') && value.includes('VOTE')) {
    return 'group_vault_vote';
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
  return 'weekly_insight';
}

function mapAction(data?: string | null): NotificationAction {
  if (!data) {
    return { type: 'none' };
  }

  try {
    const parsed = JSON.parse(data) as Record<string, string>;
    if (parsed.goalId) {
      return { type: 'goal_details', goalId: parsed.goalId };
    }
    if (parsed.vaultId) {
      return { type: 'vault_details', vaultId: parsed.vaultId };
    }
    if (parsed.groupVaultId && parsed.requestId) {
      return {
        type: 'withdrawal_approval',
        groupVaultId: parsed.groupVaultId,
        requestId: parsed.requestId,
      };
    }
    if (parsed.screen === 'BudgetEnvelopes') {
      return { type: 'budget_envelopes' };
    }
    if (parsed.screen === 'WeeklyInsights') {
      return { type: 'weekly_insights' };
    }
  } catch {
    // ignore malformed payloads
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
