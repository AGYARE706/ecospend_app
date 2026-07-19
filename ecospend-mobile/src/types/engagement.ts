export type BadgeCategory = 'FINANCE' | 'STREAK' | 'LESSON';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface StreakStats {
  currentStreak: number;
  totalActiveDays: number;
}

export interface XpStats {
  totalXp: number;
  level: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSummary {
  id: string;
  title: string;
  summary: string;
  xpReward: number;
  completed: boolean;
}

export interface LessonTrack {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: LessonSummary[];
}

export interface LessonDetail {
  id: string;
  trackId: string;
  title: string;
  summary: string;
  content: string;
  xpReward: number;
  completed: boolean;
  quiz: QuizQuestion[];
}

export interface LessonCompletionResult {
  xpEarned: number;
  newlyUnlockedBadges: Badge[];
}
