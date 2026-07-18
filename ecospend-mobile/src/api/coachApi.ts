import { apiClient } from './apiClient';

export type CoachMessageRole = 'user' | 'assistant';

export interface CoachMessage {
  id: string;
  role: CoachMessageRole;
  content: string;
  createdAt: string;
}

export interface AskCoachResult {
  conversationId: string;
  reply: CoachMessage;
}

export interface CoachConversationSummary {
  id: string;
  title: string | null;
  updatedAt: string;
}

export interface DailyInsight {
  heading: string;
  message: string;
  generatedAt: string;
}

export async function askCoach(message: string, conversationId?: string): Promise<AskCoachResult> {
  const { data } = await apiClient.post('/api/finance/coach/chat', { message, conversationId });
  return data as AskCoachResult;
}

export async function listCoachConversations(): Promise<CoachConversationSummary[]> {
  const { data } = await apiClient.get('/api/finance/coach/conversations');
  return data as CoachConversationSummary[];
}

export async function getCoachConversationMessages(conversationId: string): Promise<CoachMessage[]> {
  const { data } = await apiClient.get(`/api/finance/coach/conversations/${conversationId}/messages`);
  return data as CoachMessage[];
}

/** Returns null when the coach isn't configured on the server (204) — callers should hide the UI, not error. */
export async function getInsightOfTheDay(): Promise<DailyInsight | null> {
  const { data, status } = await apiClient.get('/api/finance/coach/insight-of-the-day', {
    validateStatus: (s) => s === 200 || s === 204,
  });
  return status === 204 ? null : (data as DailyInsight);
}
