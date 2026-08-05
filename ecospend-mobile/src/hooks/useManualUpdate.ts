import { useCallback, useState } from 'react';
import * as Updates from 'expo-updates';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'up-to-date' | 'error';

export function useManualUpdate() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkForUpdate = useCallback(async () => {
    // Skip in dev mode where Updates is disabled
    if (__DEV__ || !Updates.isEnabled) {
      setErrorMessage('Updates are not available in development mode');
      setStatus('error');
      return;
    }

    setStatus('checking');
    setErrorMessage('');

    try {
      const result = await Updates.checkForUpdateAsync();

      if (result.isAvailable) {
        setStatus('downloading');
        await Updates.fetchUpdateAsync();
        // Reload immediately to apply the new update
        await Updates.reloadAsync();
      } else {
        setStatus('up-to-date');
        // Reset to idle after showing "up to date" message
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to check for updates',
      );
      // Reset to idle after showing error
      setTimeout(() => setStatus('idle'), 4000);
    }
  }, []);

  return {
    status,
    errorMessage,
    checkForUpdate,
    isChecking: status === 'checking' || status === 'downloading',
  };
}
