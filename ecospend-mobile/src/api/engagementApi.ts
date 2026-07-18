import { apiClient } from './apiClient';
import type {
  Badge,
  LessonCompletionResult,
  LessonDetail,
  LessonTrack,
  StreakStats,
  XpStats,
} from '../types/engagement';

export async function getStreak(): Promise<StreakStats> {
  const { data } = await apiClient.get('/api/engagement/streak');
  return data as StreakStats;
}

export async function getBadges(): Promise<Badge[]> {
  const { data } = await apiClient.get('/api/engagement/badges');
  return data as Badge[];
}

export async function getXp(): Promise<XpStats> {
  const { data } = await apiClient.get('/api/engagement/xp');
  return data as XpStats;
}

export async function getLessonTracks(): Promise<LessonTrack[]> {
  const { data } = await apiClient.get('/api/engagement/lessons');
  return data as LessonTrack[];
}

export async function getLesson(id: string): Promise<LessonDetail> {
  const { data } = await apiClient.get(`/api/engagement/lessons/${id}`);
  return data as LessonDetail;
}

export async function completeLesson(id: string, quizScore: number): Promise<LessonCompletionResult> {
  const { data } = await apiClient.post(`/api/engagement/lessons/${id}/complete`, { quizScore });
  return data as LessonCompletionResult;
}
