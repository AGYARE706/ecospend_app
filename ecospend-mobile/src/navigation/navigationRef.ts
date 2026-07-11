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
