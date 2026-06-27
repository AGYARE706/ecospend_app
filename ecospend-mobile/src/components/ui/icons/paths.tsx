/**
 * Icon path registry.
 *
 * Every icon lives on a 24×24 grid and is drawn in a single, consistent
 * family: 1.8px stroke, round caps & joins, no fill (presentation attributes
 * are inherited from the parent <Svg>). A handful of icons also ship a `solid`
 * silhouette used for emphasis (e.g. focused tab bar items, filled badges).
 *
 * Add new icons here only — components reference them by name through <Icon />.
 */
import { Fragment, ReactNode } from 'react';
import { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

/** Renders the stroked (outline) geometry for an icon. */
export type IconRenderer = (color: string) => ReactNode;

export const outlineIcons: Record<string, IconRenderer> = {
  // ---- Navigation & chrome ----
  home: () => (
    <Fragment>
      <Polyline points="3 11 12 3 21 11" />
      <Path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <Path d="M9.5 21v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21" />
    </Fragment>
  ),
  list: () => (
    <Fragment>
      <Line x1="8" y1="6" x2="20" y2="6" />
      <Line x1="8" y1="12" x2="20" y2="12" />
      <Line x1="8" y1="18" x2="20" y2="18" />
      <Path d="M4 6h.01M4 12h.01M4 18h.01" />
    </Fragment>
  ),
  grid: () => (
    <Fragment>
      <Rect x="3" y="3" width="7" height="7" rx="1.5" />
      <Rect x="14" y="3" width="7" height="7" rx="1.5" />
      <Rect x="3" y="14" width="7" height="7" rx="1.5" />
      <Rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Fragment>
  ),
  search: () => (
    <Fragment>
      <Circle cx="11" cy="11" r="7" />
      <Line x1="16.5" y1="16.5" x2="21" y2="21" />
    </Fragment>
  ),
  settings: () => (
    <Fragment>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Fragment>
  ),
  bell: () => (
    <Fragment>
      <Path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5H3.5S6 15 6 9Z" />
      <Path d="M10.3 20a2 2 0 0 0 3.4 0" />
    </Fragment>
  ),
  calculator: (c) => (
    <Fragment>
      <Rect x="4" y="2" width="16" height="20" rx="2.5" />
      <Rect x="7.5" y="5.5" width="9" height="3.5" rx="1" />
      <Circle cx="8.5" cy="13" r="0.9" fill={c} stroke="none" />
      <Circle cx="12" cy="13" r="0.9" fill={c} stroke="none" />
      <Circle cx="15.5" cy="13" r="0.9" fill={c} stroke="none" />
      <Circle cx="8.5" cy="17" r="0.9" fill={c} stroke="none" />
      <Circle cx="12" cy="17" r="0.9" fill={c} stroke="none" />
      <Circle cx="15.5" cy="17" r="0.9" fill={c} stroke="none" />
    </Fragment>
  ),

  // ---- Directional ----
  'chevron-left': () => <Polyline points="15 6 9 12 15 18" />,
  'chevron-right': () => <Polyline points="9 6 15 12 9 18" />,
  'chevron-down': () => <Polyline points="6 9 12 15 18 9" />,
  'chevron-up': () => <Polyline points="6 15 12 9 18 15" />,
  'arrow-right': () => (
    <Fragment>
      <Line x1="4" y1="12" x2="19" y2="12" />
      <Polyline points="13 6 19 12 13 18" />
    </Fragment>
  ),
  'arrow-left': () => (
    <Fragment>
      <Line x1="20" y1="12" x2="5" y2="12" />
      <Polyline points="11 6 5 12 11 18" />
    </Fragment>
  ),
  'arrow-up': () => (
    <Fragment>
      <Line x1="12" y1="19" x2="12" y2="5" />
      <Polyline points="6 11 12 5 18 11" />
    </Fragment>
  ),
  'arrow-down': () => (
    <Fragment>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Polyline points="6 13 12 19 18 13" />
    </Fragment>
  ),
  'arrow-up-circle': () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="16" x2="12" y2="8.5" />
      <Polyline points="8.5 11.5 12 8 15.5 11.5" />
    </Fragment>
  ),
  'trending-up': () => (
    <Fragment>
      <Polyline points="3 16.5 9 10.5 13 14.5 21 6.5" />
      <Polyline points="16 6.5 21 6.5 21 11.5" />
    </Fragment>
  ),
  transfer: () => (
    <Fragment>
      <Polyline points="6 4 3 7 6 10" />
      <Line x1="3" y1="7" x2="17" y2="7" />
      <Polyline points="18 14 21 17 18 20" />
      <Line x1="21" y1="17" x2="7" y2="17" />
    </Fragment>
  ),
  send: () => (
    <Fragment>
      <Line x1="21" y1="3" x2="10.5" y2="13.5" />
      <Path d="M21 3l-6.5 18-4-8-8-4 18.5-6Z" />
    </Fragment>
  ),

  // ---- Actions ----
  plus: () => (
    <Fragment>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Fragment>
  ),
  'plus-circle': () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="8" x2="12" y2="16" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </Fragment>
  ),
  minus: () => <Line x1="5" y1="12" x2="19" y2="12" />,
  x: () => (
    <Fragment>
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </Fragment>
  ),
  'x-circle': () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="15" y1="9" x2="9" y2="15" />
      <Line x1="9" y1="9" x2="15" y2="15" />
    </Fragment>
  ),
  check: () => <Polyline points="5 12.5 9.5 17 19 7" />,
  'check-circle': () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="8 12.5 10.5 15 16 9.5" />
    </Fragment>
  ),
  'check-done': () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="7.5 12 10 14.5 14.5 9.5" />
      <Polyline points="11.5 14 12.5 15 17 10" />
    </Fragment>
  ),
  edit: () => (
    <Fragment>
      <Path d="M16.5 4.5l3 3L8 19l-4 1 1-4 11.5-11.5Z" />
      <Line x1="14" y1="7" x2="17" y2="10" />
    </Fragment>
  ),
  trash: () => (
    <Fragment>
      <Line x1="4" y1="7" x2="20" y2="7" />
      <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <Path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </Fragment>
  ),

  // ---- Finance ----
  wallet: (c) => (
    <Fragment>
      <Path d="M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <Path d="M16 6V5a1 1 0 0 0-1-1H5.5" />
      <Path d="M21 11h-4a2 2 0 0 0 0 4h4" />
      <Circle cx="17" cy="13" r="0.8" fill={c} stroke="none" />
    </Fragment>
  ),
  cash: (c) => (
    <Fragment>
      <Rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <Circle cx="12" cy="12" r="2.5" />
      <Circle cx="6" cy="12" r="0.7" fill={c} stroke="none" />
      <Circle cx="18" cy="12" r="0.7" fill={c} stroke="none" />
    </Fragment>
  ),
  receipt: () => (
    <Fragment>
      <Path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3Z" />
      <Line x1="9" y1="8" x2="15" y2="8" />
      <Line x1="9" y1="12" x2="15" y2="12" />
      <Line x1="9" y1="16" x2="13" y2="16" />
    </Fragment>
  ),
  tag: (c) => (
    <Fragment>
      <Path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H11l9.5 9.5a1.5 1.5 0 0 1 0 2.1l-5.9 5.9a1.5 1.5 0 0 1-2.1 0L3 11V4.5Z" />
      <Circle cx="7.5" cy="7.5" r="1.2" fill={c} stroke="none" />
    </Fragment>
  ),
  'bar-chart': () => (
    <Fragment>
      <Line x1="3" y1="21" x2="21" y2="21" />
      <Line x1="6" y1="21" x2="6" y2="11" />
      <Line x1="12" y1="21" x2="12" y2="5" />
      <Line x1="18" y1="21" x2="18" y2="14" />
    </Fragment>
  ),
  'pie-chart': () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="12" x2="12" y2="3" />
      <Line x1="12" y1="12" x2="21" y2="12" />
    </Fragment>
  ),
  flag: () => (
    <Fragment>
      <Path d="M5 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <Line x1="5" y1="22" x2="5" y2="15" />
    </Fragment>
  ),
  target: () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="12" r="5" />
      <Circle cx="12" cy="12" r="1" />
    </Fragment>
  ),

  // ---- Security ----
  lock: (c) => (
    <Fragment>
      <Rect x="4" y="10" width="16" height="11" rx="2.5" />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <Circle cx="12" cy="15" r="1.2" fill={c} stroke="none" />
      <Line x1="12" y1="16" x2="12" y2="18" />
    </Fragment>
  ),
  key: () => (
    <Fragment>
      <Circle cx="8" cy="16" r="3.5" />
      <Line x1="10.5" y1="13.5" x2="20" y2="4" />
      <Line x1="16.5" y1="7.5" x2="19" y2="10" />
      <Line x1="18.5" y1="5.5" x2="20.5" y2="7.5" />
    </Fragment>
  ),
  'shield-check': () => (
    <Fragment>
      <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <Polyline points="8.5 12 11 14.5 15.5 9.5" />
    </Fragment>
  ),

  // ---- People ----
  user: () => (
    <Fragment>
      <Circle cx="12" cy="8" r="3.5" />
      <Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </Fragment>
  ),
  users: () => (
    <Fragment>
      <Circle cx="9" cy="8" r="3" />
      <Path d="M3.5 19c0-3 2.4-5 5.5-5s5.5 2 5.5 5" />
      <Path d="M16 6.2a3 3 0 0 1 0 5.6" />
      <Path d="M16.5 14.2c2.4.3 4 2.2 4 4.8" />
    </Fragment>
  ),
  'user-plus': () => (
    <Fragment>
      <Circle cx="10" cy="8" r="3.2" />
      <Path d="M3.5 20c0-3.3 2.9-5.5 6.5-5.5" />
      <Line x1="18" y1="8" x2="18" y2="14" />
      <Line x1="15" y1="11" x2="21" y2="11" />
    </Fragment>
  ),

  // ---- Time ----
  clock: () => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="12 7 12 12 15.5 14" />
    </Fragment>
  ),
  calendar: () => (
    <Fragment>
      <Rect x="3" y="5" width="18" height="16" rx="2.5" />
      <Line x1="3" y1="9.5" x2="21" y2="9.5" />
      <Line x1="8" y1="3" x2="8" y2="6.5" />
      <Line x1="16" y1="3" x2="16" y2="6.5" />
    </Fragment>
  ),
  hourglass: () => (
    <Fragment>
      <Line x1="6" y1="3" x2="18" y2="3" />
      <Line x1="6" y1="21" x2="18" y2="21" />
      <Path d="M17 21v-3.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V21" />
      <Path d="M7 3v3.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V3" />
    </Fragment>
  ),

  // ---- Communication ----
  phone: () => (
    <Path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />
  ),
  device: () => (
    <Fragment>
      <Rect x="6" y="2" width="12" height="20" rx="2.5" />
      <Line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
    </Fragment>
  ),
  headset: () => (
    <Fragment>
      <Path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <Path d="M4 14a2 2 0 0 1 2-2h0a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-2Z" />
      <Path d="M20 14a2 2 0 0 0-2-2h0a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h0a2 2 0 0 0 2-2v0" />
      <Path d="M18 17v1a3 3 0 0 1-3 3h-3" />
    </Fragment>
  ),
  message: () => (
    <Path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-4.5A8 8 0 1 1 21 12Z" />
  ),
  messages: () => (
    <Fragment>
      <Path d="M18 10a6 6 0 0 1-8.5 5.5L5 17l1.2-3.3A6 6 0 1 1 18 10Z" />
      <Path d="M16 16.5a6 6 0 0 0 3 .5l2 1.2-.8-2.2a6 6 0 0 0-2.2-8" />
    </Fragment>
  ),

  // ---- Media ----
  camera: () => (
    <Fragment>
      <Path d="M3 8.5a2 2 0 0 1 2-2h2L8.5 4h7L17 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
      <Circle cx="12" cy="13" r="3.5" />
    </Fragment>
  ),
  image: (c) => (
    <Fragment>
      <Rect x="3" y="3" width="18" height="18" rx="2.5" />
      <Circle cx="8.5" cy="9" r="1.5" fill={c} stroke="none" />
      <Path d="M21 16l-5-5-9 9" />
    </Fragment>
  ),
  document: () => (
    <Fragment>
      <Path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <Polyline points="14 2 14 7 19 7" />
      <Line x1="8" y1="13" x2="16" y2="13" />
      <Line x1="8" y1="17" x2="13" y2="17" />
    </Fragment>
  ),
  barcode: () => (
    <Fragment>
      <Line x1="4" y1="6" x2="4" y2="18" />
      <Line x1="7" y1="6" x2="7" y2="18" />
      <Line x1="10.5" y1="6" x2="10.5" y2="18" />
      <Line x1="14" y1="6" x2="14" y2="18" />
      <Line x1="17" y1="6" x2="17" y2="18" />
      <Line x1="20" y1="6" x2="20" y2="18" />
    </Fragment>
  ),

  // ---- Session ----
  'log-in': () => (
    <Fragment>
      <Path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
      <Line x1="3" y1="12" x2="15" y2="12" />
      <Polyline points="11 8 15 12 11 16" />
    </Fragment>
  ),
  'log-out': () => (
    <Fragment>
      <Path d="M9 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Fragment>
  ),
  eye: () => (
    <Fragment>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <Circle cx="12" cy="12" r="3" />
    </Fragment>
  ),
  'eye-off': () => (
    <Fragment>
      <Path d="M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4" />
      <Path d="M6.3 6.3A18 18 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 3.6-.7" />
      <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <Line x1="3" y1="3" x2="21" y2="21" />
    </Fragment>
  ),

  // ---- Status ----
  'alert-circle': (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="7.5" x2="12" y2="13" />
      <Circle cx="12" cy="16.5" r="0.7" fill={c} stroke="none" />
    </Fragment>
  ),
  'alert-triangle': (c) => (
    <Fragment>
      <Path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      <Line x1="12" y1="9" x2="12" y2="13.5" />
      <Circle cx="12" cy="17" r="0.7" fill={c} stroke="none" />
    </Fragment>
  ),
  info: (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="11" x2="12" y2="16.5" />
      <Circle cx="12" cy="7.8" r="0.7" fill={c} stroke="none" />
    </Fragment>
  ),
  'help-circle': (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2-2.5 3.4" />
      <Circle cx="12" cy="16.8" r="0.7" fill={c} stroke="none" />
    </Fragment>
  ),

  // ---- Reactions & rewards ----
  star: () => (
    <Path d="M12 3.2l2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.5l-5.2 2.75 1-5.8L3.6 9.35l5.8-.85L12 3.2Z" />
  ),
  flame: () => (
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  leaf: () => (
    <Fragment>
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <Path d="M2 21c0-3 1.85-5.4 5.1-6" />
    </Fragment>
  ),
  sparkles: () => (
    <Fragment>
      <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <Path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </Fragment>
  ),
  bulb: () => (
    <Fragment>
      <Path d="M15.1 14c.18-1 .65-1.75 1.4-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.25 1.5 3.5.76.76 1.23 1.5 1.4 2.5" />
      <Line x1="9" y1="18" x2="15" y2="18" />
      <Line x1="10" y1="21.5" x2="14" y2="21.5" />
    </Fragment>
  ),
  trophy: () => (
    <Fragment>
      <Path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <Path d="M7 5H4.5a2 2 0 0 0 0 4H7" />
      <Path d="M17 5h2.5a2 2 0 0 1 0 4H17" />
      <Line x1="12" y1="14" x2="12" y2="17.5" />
      <Path d="M8.5 21c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5Z" />
    </Fragment>
  ),
  heart: () => (
    <Path d="M12 20.5s-7-4.3-9.2-8.6A5.2 5.2 0 0 1 12 6.5a5.2 5.2 0 0 1 9.2 5.4C19 16.2 12 20.5 12 20.5Z" />
  ),
  'thumbs-up': () => (
    <Fragment>
      <Path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" />
      <Path d="M7 11l3.5-7a2 2 0 0 1 2.5 2v3h5a2 2 0 0 1 2 2.4l-1.2 5.5a2 2 0 0 1-2 1.6H7" />
    </Fragment>
  ),
  'thumbs-down': () => (
    <Fragment>
      <Path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Z" />
      <Path d="M17 13l-3.5 7a2 2 0 0 1-2.5-2v-3H6a2 2 0 0 1-2-2.4l1.2-5.5A2 2 0 0 1 7.2 4H17" />
    </Fragment>
  ),
  flash: () => <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" />,

  // ---- Categories ----
  utensils: () => (
    <Fragment>
      <Path d="M8 3v18" />
      <Path d="M5.5 3v4.5a2.5 2.5 0 0 0 5 0V3" />
      <Path d="M16.5 3c-1.2 2-1.2 6 0 8.5V21" />
    </Fragment>
  ),
  car: (c) => (
    <Fragment>
      <Path d="M5 17h14a1 1 0 0 0 1-1v-3.2a2 2 0 0 0-.3-1.1l-1.6-2.4A3 3 0 0 0 15.6 8H8.4a3 3 0 0 0-2.5 1.3L4.3 11.7a2 2 0 0 0-.3 1.1V16a1 1 0 0 0 1 1Z" />
      <Line x1="4.5" y1="12.5" x2="19.5" y2="12.5" />
      <Circle cx="7.5" cy="17" r="1.4" fill={c} stroke="none" />
      <Circle cx="16.5" cy="17" r="1.4" fill={c} stroke="none" />
    </Fragment>
  ),
  briefcase: () => (
    <Fragment>
      <Rect x="3" y="7.5" width="18" height="13" rx="2.5" />
      <Path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <Line x1="3" y1="13" x2="21" y2="13" />
    </Fragment>
  ),
  bank: () => (
    <Fragment>
      <Path d="M3 9.5l9-5.5 9 5.5" />
      <Line x1="4" y1="9.5" x2="20" y2="9.5" />
      <Line x1="6.5" y1="10" x2="6.5" y2="17" />
      <Line x1="12" y1="10" x2="12" y2="17" />
      <Line x1="17.5" y1="10" x2="17.5" y2="17" />
      <Line x1="3.5" y1="20" x2="20.5" y2="20" />
    </Fragment>
  ),
  box: () => (
    <Fragment>
      <Path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2Z" />
      <Polyline points="3 8.2 12 13.5 21 8.2" />
      <Line x1="12" y1="13.5" x2="12" y2="21" />
    </Fragment>
  ),
  bolt: () => <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" />,

  // ---- Misc / dev ----
  layers: () => (
    <Fragment>
      <Path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <Polyline points="2 12 12 17 22 12" />
      <Polyline points="2 17 12 22 22 17" />
    </Fragment>
  ),
  'git-branch': () => (
    <Fragment>
      <Line x1="6" y1="3" x2="6" y2="15" />
      <Circle cx="6" cy="18" r="3" />
      <Circle cx="18" cy="6" r="3" />
      <Path d="M18 9a9 9 0 0 1-9 9" />
    </Fragment>
  ),
  'git-compare': () => (
    <Fragment>
      <Circle cx="6" cy="18" r="3" />
      <Circle cx="18" cy="6" r="3" />
      <Path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <Path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </Fragment>
  ),
  laptop: () => (
    <Fragment>
      <Path d="M5 5h14a1 1 0 0 1 1 1v9H4V6a1 1 0 0 1 1-1Z" />
      <Line x1="2" y1="19" x2="22" y2="19" />
    </Fragment>
  ),
};

/**
 * Solid silhouettes for emphasis states. Names not present here fall back to
 * a bolder stroke of the outline version.
 */
export const solidIcons: Record<string, IconRenderer> = {
  home: (c) => (
    <Path
      d="M11.3 3.3a1 1 0 0 1 1.4 0l8 7A1 1 0 0 1 21 11h-1v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5H5.5A1.5 1.5 0 0 1 4 19.5V11H3a1 1 0 0 1-.7-1.7l9-6Z"
      fill={c}
      stroke="none"
    />
  ),
  wallet: (c) => (
    <Fragment>
      <Path
        d="M4 6h12a2 2 0 0 1 2 2v.5h-2.5a3.5 3.5 0 0 0 0 7H18v.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        fill={c}
        stroke="none"
      />
      <Path
        d="M22 11v3a1 1 0 0 1-1 1h-5.5a2.5 2.5 0 0 1 0-5H21a1 1 0 0 1 1 1Z"
        fill={c}
        stroke="none"
      />
    </Fragment>
  ),
  user: (c) => (
    <Fragment>
      <Circle cx="12" cy="8" r="4" fill={c} stroke="none" />
      <Path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" fill={c} stroke="none" />
    </Fragment>
  ),
  bell: (c) => (
    <Fragment>
      <Path d="M6 9a6 6 0 0 1 12 0c0 5.5 2.2 7 2.2 7H3.8S6 14.5 6 9Z" fill={c} stroke="none" />
      <Path d="M10 19.5a2.2 2.2 0 0 0 4 0Z" fill={c} stroke="none" />
    </Fragment>
  ),
  flag: (c) => (
    <Fragment>
      <Path d="M5 14s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1Z" fill={c} stroke="none" />
      <Line x1="5" y1="22" x2="5" y2="14" stroke={c} />
    </Fragment>
  ),
  lock: (c) => (
    <Fragment>
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <Rect x="4" y="10" width="16" height="11" rx="2.5" fill={c} stroke="none" />
    </Fragment>
  ),
  list: (c) => (
    <Fragment>
      <Line x1="8" y1="6" x2="20" y2="6" stroke={c} strokeWidth={2.4} />
      <Line x1="8" y1="12" x2="20" y2="12" stroke={c} strokeWidth={2.4} />
      <Line x1="8" y1="18" x2="20" y2="18" stroke={c} strokeWidth={2.4} />
      <Circle cx="4" cy="6" r="1.2" fill={c} stroke="none" />
      <Circle cx="4" cy="12" r="1.2" fill={c} stroke="none" />
      <Circle cx="4" cy="18" r="1.2" fill={c} stroke="none" />
    </Fragment>
  ),
  star: (c) => (
    <Path
      d="M12 3.2l2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.5l-5.2 2.75 1-5.8L3.6 9.35l5.8-.85L12 3.2Z"
      fill={c}
      stroke="none"
    />
  ),
  flame: (c) => (
    <Path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"
      fill={c}
      stroke="none"
    />
  ),
  leaf: (c) => (
    <Fragment>
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" fill={c} stroke="none" />
      <Path d="M2 21c0-3 1.85-5.4 5.1-6" stroke={c} />
    </Fragment>
  ),
  sparkles: (c) => (
    <Fragment>
      <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" fill={c} stroke="none" />
      <Path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" fill={c} stroke="none" />
    </Fragment>
  ),
  'check-circle': (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" fill={c} stroke="none" />
      <Polyline points="8 12.5 10.5 15 16 9.5" stroke="#FFFFFF" strokeWidth={2} />
    </Fragment>
  ),
  'x-circle': (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" fill={c} stroke="none" />
      <Line x1="15" y1="9" x2="9" y2="15" stroke="#FFFFFF" strokeWidth={2} />
      <Line x1="9" y1="9" x2="15" y2="15" stroke="#FFFFFF" strokeWidth={2} />
    </Fragment>
  ),
  'alert-circle': (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" fill={c} stroke="none" />
      <Line x1="12" y1="7.5" x2="12" y2="13" stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx="12" cy="16.3" r="1" fill="#FFFFFF" stroke="none" />
    </Fragment>
  ),
  'alert-triangle': (c) => (
    <Fragment>
      <Path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" fill={c} stroke="none" />
      <Line x1="12" y1="9" x2="12" y2="13.5" stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx="12" cy="17" r="1" fill="#FFFFFF" stroke="none" />
    </Fragment>
  ),
  info: (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" fill={c} stroke="none" />
      <Line x1="12" y1="11" x2="12" y2="16.5" stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx="12" cy="7.8" r="1" fill="#FFFFFF" stroke="none" />
    </Fragment>
  ),
  'shield-check': (c) => (
    <Fragment>
      <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" fill={c} stroke="none" />
      <Polyline points="8.5 12 11 14.5 15.5 9.5" stroke="#FFFFFF" strokeWidth={2} />
    </Fragment>
  ),
  trophy: (c) => (
    <Fragment>
      <Path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill={c} stroke="none" />
      <Path d="M7 5H4.5a2 2 0 0 0 0 4H7M17 5h2.5a2 2 0 0 1 0 4H17" stroke={c} />
      <Path d="M8.5 21c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5Z" fill={c} stroke="none" />
      <Line x1="12" y1="14" x2="12" y2="17.5" stroke={c} />
    </Fragment>
  ),
  heart: (c) => (
    <Path
      d="M12 20.5s-7-4.3-9.2-8.6A5.2 5.2 0 0 1 12 6.5a5.2 5.2 0 0 1 9.2 5.4C19 16.2 12 20.5 12 20.5Z"
      fill={c}
      stroke="none"
    />
  ),
  clock: (c) => (
    <Fragment>
      <Circle cx="12" cy="12" r="9" fill={c} stroke="none" />
      <Polyline points="12 7 12 12 15.5 14" stroke="#FFFFFF" strokeWidth={2} />
    </Fragment>
  ),
};
