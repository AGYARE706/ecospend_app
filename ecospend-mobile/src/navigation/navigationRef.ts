import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

import type { AppStackParamList, TabParamList } from './types';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

/**
 * Strip the nested `{ screen }` directive React Navigation stores on a tab
 * route after a nested `navigate('MainTabs', { screen, params: { screen } })`.
 * Left in place, that param lingers on the tab route and can be replayed by any
 * consumer that re-sends `route.params` on a tab press — the bug that made the
 * Profile tab reopen Financial Lessons. FloatingTabBar no longer replays those
 * params, so this is defensive hygiene that keeps the stored state honest.
 */
function clearTabRouteParams(tab: keyof TabParamList): void {
  if (!navigationRef.isReady()) {
    return;
  }
  const root = navigationRef.getRootState();
  const mainTabs = root.routes.find((r) => r.name === 'MainTabs');
  const tabRoute = mainTabs?.state?.routes.find((r) => r.name === tab);
  if (!tabRoute?.key) {
    return;
  }
  navigationRef.dispatch({
    ...CommonActions.setParams({ screen: undefined, params: undefined }),
    source: tabRoute.key,
  });
}

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
    clearTabRouteParams('ProfileTab');
  }
}

/** Switches to the Profile tab (its own root screen). */
export function navigateToProfileTab(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Profile' },
    });
    clearTabRouteParams('ProfileTab');
  }
}

/** Opens the Security screen (nested under Profile tab). */
export function navigateToSecurity(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Security' },
    });
    clearTabRouteParams('ProfileTab');
  }
}

/** Opens the Help & Support screen (nested under Profile tab). */
export function navigateToHelpSupport(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'HelpSupport' },
    });
    clearTabRouteParams('ProfileTab');
  }
}

/** Opens Financial Lessons (nested under Profile tab). */
export function navigateToLearn(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'ProfileTab',
      params: { screen: 'Learn' },
    });
    clearTabRouteParams('ProfileTab');
  }
}
