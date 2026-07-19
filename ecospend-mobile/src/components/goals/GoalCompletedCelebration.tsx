import CompletionCelebration from '../ui/CompletionCelebration';

export interface GoalCompletedCelebrationProps {
  visible: boolean;
  goalName: string;
  onWithdrawNow: () => void;
  onDismiss: () => void;
}

/**
 * Shown the moment a contribution pushes a goal to (or past) its target —
 * the one-time celebration moment. Reaching the goal again later (e.g. from
 * the Completed tab) goes straight to GoalDetailsScreen instead, which has
 * its own persistent "ready to withdraw" banner.
 */
export default function GoalCompletedCelebration({
  visible,
  goalName,
  onWithdrawNow,
  onDismiss,
}: GoalCompletedCelebrationProps) {
  return (
    <CompletionCelebration
      visible={visible}
      icon="trophy"
      title="Goal Completed! 🎉"
      subtitle={`You've hit your target for "${goalName}". Ready to put that money to use?`}
      primaryLabel="Withdraw Now"
      primaryIcon="arrow-right"
      onPrimaryPress={onWithdrawNow}
      secondaryLabel="Maybe Later"
      onSecondaryPress={onDismiss}
    />
  );
}
