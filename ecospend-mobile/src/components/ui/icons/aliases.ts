/**
 * Compatibility map: legacy @expo/vector-icons (Ionicons) names → the new
 * canonical SVG icon set. `solid` marks names that were the filled Ionicons
 * variant, so they render the solid silhouette by default.
 *
 * New code should prefer canonical names (e.g. "bell", "wallet") directly;
 * these aliases let the migration happen incrementally without breakage.
 */
export type IconAlias = { name: string; solid?: boolean };

export const iconAliases: Record<string, IconAlias> = {
  // actions
  add: { name: 'plus' },
  'add-circle-outline': { name: 'plus-circle' },
  remove: { name: 'minus' },
  close: { name: 'x' },
  'close-circle': { name: 'x-circle', solid: true },
  'close-circle-outline': { name: 'x-circle' },
  checkmark: { name: 'check' },
  'checkmark-circle': { name: 'check-circle', solid: true },
  'checkmark-circle-outline': { name: 'check-circle' },
  'checkmark-done-circle-outline': { name: 'check-done' },
  'create-outline': { name: 'edit' },
  'trash-outline': { name: 'trash' },

  // directional
  'chevron-back': { name: 'chevron-left' },
  'chevron-forward': { name: 'chevron-right' },
  'chevron-down': { name: 'chevron-down' },
  'arrow-forward': { name: 'arrow-right' },
  'arrow-up': { name: 'arrow-up' },
  'arrow-down': { name: 'arrow-down' },
  'arrow-up-circle-outline': { name: 'arrow-up-circle' },
  'trending-up': { name: 'trending-up' },
  'trending-up-outline': { name: 'trending-up' },

  // finance & data
  'wallet-outline': { name: 'wallet' },
  'cash-outline': { name: 'cash' },
  'receipt-outline': { name: 'receipt' },
  'pricetag-outline': { name: 'tag' },
  analytics: { name: 'bar-chart' },
  'analytics-outline': { name: 'bar-chart' },
  'bar-chart-outline': { name: 'bar-chart' },
  'stats-chart-outline': { name: 'bar-chart' },
  'pie-chart-outline': { name: 'pie-chart' },
  flag: { name: 'flag', solid: true },
  'flag-outline': { name: 'flag' },

  // security
  'lock-closed': { name: 'lock', solid: true },
  'lock-closed-outline': { name: 'lock' },
  key: { name: 'key' },
  'key-outline': { name: 'key' },
  'shield-checkmark': { name: 'shield-check', solid: true },
  'shield-checkmark-outline': { name: 'shield-check' },

  // people
  people: { name: 'users' },
  'people-outline': { name: 'users' },
  'person-outline': { name: 'user' },
  'person-add-outline': { name: 'user-plus' },

  // time
  time: { name: 'clock', solid: true },
  'time-outline': { name: 'clock' },
  'today-outline': { name: 'calendar' },
  calendar: { name: 'calendar' },
  'calendar-outline': { name: 'calendar' },
  'hourglass-outline': { name: 'hourglass' },

  // communication & media
  'call-outline': { name: 'phone' },
  'phone-portrait-outline': { name: 'device' },
  'headset-outline': { name: 'headset' },
  'chatbubble-outline': { name: 'message' },
  'chatbubbles-outline': { name: 'messages' },
  camera: { name: 'camera' },
  'image-outline': { name: 'image' },
  'document-text-outline': { name: 'document' },
  'reader-outline': { name: 'document' },
  'barcode-outline': { name: 'barcode' },

  // chrome / nav
  'home-outline': { name: 'home' },
  'list-outline': { name: 'list' },
  'search-outline': { name: 'search' },
  search: { name: 'search' },
  'settings-outline': { name: 'settings' },
  notifications: { name: 'bell', solid: true },
  'notifications-outline': { name: 'bell' },
  'calculator-outline': { name: 'calculator' },

  // session
  'enter-outline': { name: 'log-in' },
  'log-out-outline': { name: 'log-out' },
  'eye-outline': { name: 'eye' },

  // status
  'alert-circle': { name: 'alert-circle', solid: true },
  'alert-circle-outline': { name: 'alert-circle' },
  warning: { name: 'alert-triangle', solid: true },
  'warning-outline': { name: 'alert-triangle' },
  'information-circle-outline': { name: 'info' },
  'help-circle-outline': { name: 'help-circle' },

  // rewards & reactions
  star: { name: 'star', solid: true },
  'star-outline': { name: 'star' },
  flame: { name: 'flame', solid: true },
  'flame-outline': { name: 'flame' },
  leaf: { name: 'leaf', solid: true },
  'leaf-outline': { name: 'leaf' },
  sparkles: { name: 'sparkles', solid: true },
  'sparkles-outline': { name: 'sparkles' },
  'bulb-outline': { name: 'bulb' },
  trophy: { name: 'trophy', solid: true },
  'trophy-outline': { name: 'trophy' },
  'heart-outline': { name: 'heart' },
  'thumbs-up-outline': { name: 'thumbs-up' },
  'thumbs-down-outline': { name: 'thumbs-down' },
  'flash-outline': { name: 'flash' },

  // misc / dev
  'swap-horizontal': { name: 'transfer' },
  'swap-horizontal-outline': { name: 'transfer' },
  'grid-outline': { name: 'grid' },
  'send-outline': { name: 'send' },
  'layers-outline': { name: 'layers' },
  'git-branch-outline': { name: 'git-branch' },
  'git-compare-outline': { name: 'git-compare' },
  'laptop-outline': { name: 'laptop' },
};
