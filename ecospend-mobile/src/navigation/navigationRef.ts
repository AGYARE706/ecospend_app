import { createNavigationContainerRef } from '@react-navigation/native';

import type { AppStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

export function navigateApp<RouteName extends keyof AppStackParamList>(
  name: RouteName,
  ...args: undefined extends AppStackParamList[RouteName]
    ? [params?: AppStackParamList[RouteName]]
    : [params: AppStackParamList[RouteName]]
): void {
  if (navigationRef.isReady()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigationRef.navigate(name as any, args[0] as any);
  }
}

/** Opens the Plus upgrade screen (nested under Profile tab). */
export function navigateToSubscription(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Subscription' },
    });
  }
}

/** Switches to the Profile tab (its own root screen). */
export function navigateToProfileTab(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Profile' },
    });
  }
}

/** Opens the Security screen (nested under Profile tab). */
export function navigateToSecurity(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Security' },
    });
  }
}

/** Opens the Help & Support screen (nested under Profile tab). */
export function navigateToHelpSupport(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'HelpSupport' },
    });
  }
}

/** Opens Financial Lessons (nested under Profile tab). */
export function navigateToLearn(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Learn' },
    });
  }
}
