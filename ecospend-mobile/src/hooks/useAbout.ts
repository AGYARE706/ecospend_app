import { useCallback, useMemo, useState } from 'react';

import appConfig from '../../app.json';

export const APP_DESCRIPTION =
  'EcoSpend is a personal finance app for tracking spending, building savings goals, and growing money through secure personal and group vaults — designed for everyday use in Ghana.';

export const APP_MISSION =
  'Our mission is to make disciplined saving simple and social: help people understand where their money goes, reach meaningful goals, and build financial confidence one step at a time.';

export function useAbout() {
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  const version = useMemo(
    () => appConfig.expo.version ?? '1.0.0',
    [],
  );

  const buildLabel = useMemo(() => `Version ${version}`, [version]);

  const openPrivacySheet = useCallback(() => {
    setShowPrivacySheet(true);
  }, []);

  const closePrivacySheet = useCallback(() => {
    setShowPrivacySheet(false);
  }, []);

  const openTermsSheet = useCallback(() => {
    setShowTermsSheet(true);
  }, []);

  const closeTermsSheet = useCallback(() => {
    setShowTermsSheet(false);
  }, []);

  return {
    version,
    buildLabel,
    description: APP_DESCRIPTION,
    mission: APP_MISSION,
    showPrivacySheet,
    showTermsSheet,
    openPrivacySheet,
    closePrivacySheet,
    openTermsSheet,
    closeTermsSheet,
  };
}
