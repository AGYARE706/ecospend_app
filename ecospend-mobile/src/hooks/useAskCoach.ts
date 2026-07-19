import { useCallback, useState } from 'react';

import { askCoach, type CoachMessage } from '../api/coachApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';

export type AskCoachPhase = 'idle' | 'sending' | 'failed';

let localIdCounter = 0;
function localId(): string {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

/** Drives the Abena chat screen — one conversation per mount, no streaming (see coachApi.ts). */
export function useAskCoach() {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [phase, setPhase] = useState<AskCoachPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || phase === 'sending') {
        return;
      }

      setError(null);
      setMessages((prev) => [
        ...prev,
        { id: localId(), role: 'user', content: trimmed, createdAt: new Date().toISOString() },
      ]);
      setPhase('sending');

      try {
        const result = await askCoach(trimmed, conversationId);
        setConversationId(result.conversationId);
        setMessages((prev) => [...prev, result.reply]);
        setPhase('idle');
      } catch (err) {
        setPhase('failed');
        setError(getApiErrorMessage(err, 'Abena could not answer that right now.'));
      }
    },
    [conversationId, phase],
  );

  return { messages, phase, error, send };
}
