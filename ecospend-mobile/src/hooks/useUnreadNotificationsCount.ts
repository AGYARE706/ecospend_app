import { useCallback, useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

import * as notificationsApi from '../api/notificationsApi';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 30000;

/** Polls the unread count while the owning screen is focused, so every bell icon stays live. */
export function useUnreadNotificationsCount(): number {
  const { isAuthenticated } = useAuth();
  const isFocused = useIsFocused();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      setCount(await notificationsApi.getUnreadCount());
    } catch {
      // keep the last known count on a transient failure
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(interval);
  }, [isFocused, refresh]);

  return count;
}
