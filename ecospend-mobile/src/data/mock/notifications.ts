import type { AppNotification } from '../../types/notification';

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-001',
    type: 'budget_alert',
    title: 'Budget Alert',
    message: 'Your Food envelope is at 85% — GH₵ 425.00 of GH₵ 500.00 spent.',
    createdAt: hoursAgo(2),
    read: false,
    action: { type: 'budget_envelopes' },
  },
  {
    id: 'notif-002',
    type: 'group_vault_vote',
    title: 'Group Vault Vote Request',
    message: 'Ama Boateng requested GH₵ 1,200.00 from London Trip Squad. Your vote is needed.',
    createdAt: hoursAgo(5),
    read: false,
    action: {
      type: 'withdrawal_approval',
      groupVaultId: 'gv-trip',
      requestId: 'wr-2',
    },
  },
  {
    id: 'notif-003',
    type: 'vault_matured',
    title: 'Vault Matured',
    message: 'Your Rent Vault has reached maturity. GH₵ 4,200.00 is ready to withdraw.',
    createdAt: daysAgo(2),
    read: false,
    action: { type: 'vault_details', vaultId: 'vault-rent' },
  },
  {
    id: 'notif-004',
    type: 'goal_completed',
    title: 'Goal Completed',
    message: 'Congratulations! You reached your New Sewing Machine goal of GH₵ 800.00.',
    createdAt: daysAgo(3),
    read: true,
    action: { type: 'goal_details', goalId: 'goal-002' },
  },
  {
    id: 'notif-005',
    type: 'weekly_insight',
    title: 'Weekly Insight',
    message: 'You saved 12% more than last week. Tap to view your full spending breakdown.',
    createdAt: daysAgo(5),
    read: true,
    action: { type: 'weekly_insights' },
  },
  {
    id: 'notif-006',
    type: 'budget_alert',
    title: 'Budget Alert',
    message: 'Transport envelope exceeded its limit by GH₵ 45.00 this month.',
    createdAt: daysAgo(12),
    read: true,
    action: { type: 'budget_envelopes' },
  },
  {
    id: 'notif-007',
    type: 'vault_matured',
    title: 'Vault Matured',
    message: 'Holiday Vault matured with GH₵ 2,500.00 available for withdrawal.',
    createdAt: daysAgo(24),
    read: true,
    action: { type: 'vault_details', vaultId: 'vault-holiday' },
  },
];
