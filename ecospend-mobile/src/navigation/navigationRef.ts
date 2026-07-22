import {
  CommonActions,
  createNavigationContainerRef,
  type NavigatorScreenParams,
} from '@react-navigation/native';

import type { AppStackParamList, TabParamList } from './types';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

/** The initial (root) screen of each tab's stack — see the Stack navigators. */
const TAB_ROOT_SCREEN: Record<keyof TabParamList, string> = {
  DashboardTab: 'Dashboard',
  TransactionsTab: 'TransactionsList',
  GoalsTab: 'SavingsGoals',
  VaultTab: 'VaultDashboard',
  ProfileTab: 'Profile',
};

/** Extract a tab's nested stack param list from `TabParamList`. */
type StackOf<Tab extends keyof TabParamList> =
  TabParamList[Tab] extends NavigatorScreenParams<infer S> ? S : never;

/**
 * Strip the nested `{ screen }` directive React Navigation stores on a tab
 * route after a nested navigate. Left in place, that param lingers on the tab
 * route and can be replayed by any consumer that re-sends `route.params` on a
 * tab press — the bug that made the Profile tab reopen Financial Lessons.
 * FloatingTabBar no longer replays those params, so this is defence-in-depth
 * that keeps the stored state honest.
 */
function clearTabRouteParams(tab: keyof TabParamList): void {
  if (!navigationRef.isReady()) {
    return;
  }
  const root = navigationRef.getRootState();
  const mainTabs = root.routes.find((r) => r.name === 'MainTabs');
  const tabsState = mainTabs?.state;
  const tabRoute = tabsState?.routes.find((r) => r.name === tab);
  if (!tabsState?.key || !tabRoute?.key) {
    return;
  }
  // A tab's nested stack is lazy — it has no `.state` of its own until it
  // actually mounts (first visit this session). Until then, the {screen,
  // params} we just set ARE the only way it'll know what to open once it
  // does mount. Clearing them here — before that mount happens — silently
  // strands it on its default screen instead (this is exactly what broke
  // "jump straight to Financial Lessons" the first time a session visited
  // the Profile tab via the Dashboard shortcut rather than the tab bar).
  // Only an already-mounted tab (real `.state` present) has genuinely
  // stale params left over from an earlier navigate — that's the case this
  // cleanup exists for.
  if (!tabRoute.state) {
    return;
  }
  navigationRef.dispatch({
    ...CommonActions.setParams({ screen: undefined, params: undefined }),
    source: tabRoute.key,
    // Dispatching from the root ref only ever checks the root navigator's
    // own routes unless `target` names the nested navigator to drill into —
    // `source` alone (a route key one level down, inside MainTabs' tab
    // navigator) was silently failing with "action was not handled by any
    // navigator" on every cross-tab navigate.
    target: tabsState.key,
  });
}

/**
 * The one safe way to navigate to a screen nested under a bottom tab.
 *
 * For a non-root target it passes `initial: false`, so the tab's stack becomes
 * `[tabRootScreen, target]`: Back returns to the tab root and `popToTopOnBlur`
 * (set in TabNavigator) resets to the root — a tab can never be stranded on a
 * deep screen. (`initial: false` is skipped for a root target, which would
 * otherwise duplicate it.)
 *
 * Do NOT call `navigate('MainTabs', { screen, params: { screen } })` directly
 * anywhere — route every cross-tab navigation through this helper.
 */
export function navigateToTabScreen<
  Tab extends keyof TabParamList,
  Screen extends keyof StackOf<Tab> & string,
>(tab: Tab, screen: Screen, params?: StackOf<Tab>[Screen]): void {
  if (!navigationRef.isReady()) {
    return;
  }
  const isRoot = TAB_ROOT_SCREEN[tab] === screen;
  navigationRef.navigate('MainTabs', {
    screen: tab,
    params: { screen, params, ...(isRoot ? {} : { initial: false }) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  clearTabRouteParams(tab);
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
  navigateToTabScreen('ProfileTab', 'Subscription');
}

/** Switches to the Profile tab (its own root screen). */
export function navigateToProfileTab(): void {
  navigateToTabScreen('ProfileTab', 'Profile');
}

/** Opens the Security screen (nested under Profile tab). */
export function navigateToSecurity(): void {
  navigateToTabScreen('ProfileTab', 'Security');
}

/** Opens the Help & Support screen (nested under Profile tab). */
export function navigateToHelpSupport(): void {
  navigateToTabScreen('ProfileTab', 'HelpSupport');
}

/** Opens Financial Lessons (nested under Profile tab). */
export function navigateToLearn(): void {
  navigateToTabScreen('ProfileTab', 'Learn');
}
