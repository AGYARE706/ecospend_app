/**
 * Icon — the single SVG icon primitive for the whole app.
 *
 * One consistent family: 24×24 grid, 1.8px stroke, round caps & joins.
 * Pass a canonical name ("bell", "wallet", "chevron-right") or a legacy
 * Ionicons name (resolved via the alias map during migration).
 *
 *   <Icon name="wallet" size={20} color={colors.primary} />
 *   <Icon name="bell" filled />            // force the solid silhouette
 *   <Icon name="search" strokeWidth={2} /> // heavier stroke
 */
import Svg from 'react-native-svg';

import { useTheme } from '../../../theme';
import { iconAliases } from './aliases';
import { outlineIcons, solidIcons } from './paths';

export type IconName = keyof typeof outlineIcons | keyof typeof iconAliases;

export interface IconProps {
  /** Canonical or legacy icon name. Unknown names render a help-circle. */
  name: IconName | (string & {});
  size?: number;
  color?: string;
  /** Force the filled silhouette where one exists. */
  filled?: boolean;
  /** Override stroke weight (outline icons only). Defaults to a size-aware value. */
  strokeWidth?: number;
}

export default function Icon({
  name,
  size = 24,
  color,
  filled,
  strokeWidth,
}: IconProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.textDark;
  const alias = iconAliases[name as string];
  const canonical = alias?.name ?? (name as string);
  const useSolid = filled ?? alias?.solid ?? false;

  const renderer =
    (useSolid && solidIcons[canonical]) ||
    outlineIcons[canonical] ||
    outlineIcons['help-circle'];

  // Keep optical weight steady as icons scale up/down.
  const stroke = strokeWidth ?? (size >= 32 ? 1.6 : size <= 16 ? 2 : 1.8);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={resolvedColor}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {renderer(resolvedColor)}
    </Svg>
  );
}
