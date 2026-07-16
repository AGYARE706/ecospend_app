export type NotificationType =
  | 'vault_matured'
  | 'budget_alert'
  | 'goal_completed'
  | 'weekly_insight'
  | 'group_vault_reminder'
  | 'group_vault_invite'
  | 'group_vault_vote'
  | 'group_vault_withdrawal_update'
  | 'group_vault_activity'
  | 'plus_upgrade'
  | 'wallet_topup'
  | 'system';

export type NotificationGroupKey = 'today' | 'thisWeek' | 'earlier';

export type NotificationAction =
  | { type: 'weekly_insights' }
  | { type: 'budget_envelopes' }
  | { type: 'goal_details'; goalId: string }
  | { type: 'vault_details'; vaultId: string }
  | { type: 'group_vault_details'; groupVaultId: string }
  | { type: 'join_group_vault'; inviteCode: string }
  | { type: 'subscription' }
  | {
      type: 'withdrawal_approval';
      groupVaultId: string;
      requestId: string;
    }
  | { type: 'none' };

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  action: NotificationAction;
}

export interface NotificationSection {
  key: NotificationGroupKey;
  title: string;
  data: AppNotification[];
}
