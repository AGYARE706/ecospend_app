# EcoSpend Design System

A premium, eco-fintech visual language with an SVG-driven iconography layer.
This document is the reference for building and migrating screens.

## Principles

- **Token-first.** Never hard-code a hex, size, radius or shadow in a screen.
  Pull from `src/theme`. If a value is missing, add a token — don't inline one.
- **One icon family.** All glyphs come from the custom `<Icon />` SVG set. No
  emoji or `@expo/vector-icons` in new code.
- **Clear hierarchy.** Every surface, button and text run maps to a named role
  so emphasis is intentional and consistent.
- **Quiet motion.** Animations are short and purposeful (see `motion.ts`).

---

## Tokens (`src/theme`)

### Color (`colors.ts`)
Raw tonal scales live in `palette` (`green`, `neutral`, `teal`, `gold`,
`success`, `warning`, `error`, `info`), each `25 → 900`. Components use the
semantic `colors` map, never `palette` directly (except gradients).

| Intent | Token |
| --- | --- |
| Brand action | `colors.primary`, `primaryHover`, `primaryPressed` |
| Brand tint surface | `colors.primaryBackground`, `primarySubtle` |
| Accent (highlights) | `colors.accent` / `accentLight` (teal) |
| Rewards / streaks | `colors.gold` / `goldLight` |
| Text | `textDark` → `textSecondary` → `textMuted` → `textLight` |
| Surfaces | `cardBackground`, `pageBackground`, `surfaceSunken` |
| Borders | `border`, `borderStrong`, `borderSubtle`, `divider` |
| Semantic | `success` / `warning` / `error` / `info` (+ `*Light`, `*Strong`) |

### Typography (`typography.ts`)
Spread a named role and override only color:
```tsx
<Text style={[typography.h2, { color: colors.textDark }]}>Balance</Text>
```
Roles: `display, h1, h2, h3, subheading, bodyLg, body, bodySm, label,
caption, overline, amount`. Primitives `fontSize` / `fontWeight` remain.

### Spacing (`spacing.ts`)
4pt grid: `xxs(2) xs(4) sm(8) smd(12) md(16) mlg(20) lg(24) xl(32) xxl(48) xxxl(64)`.

### Radius (`radius.ts`)
Numeric (`xs–xxl`) plus component roles: `button, input, control, chip, card,
heroCard, sheet, full`.

### Elevation (`shadows.ts`)
`shadowXs → shadowSm → shadowMd → shadowLg`, plus `shadowBrand` (green glow for
primary CTAs and the hero balance card). Legacy aliases `subtleShadow`,
`cardShadow` retained.

### Motion (`motion.ts`)
`duration` (instant/fast/base/slow), `easing` (standard/decelerate/accelerate),
`pressScale`, `spring`.

---

## Iconography (`src/components/ui/icons`)

A single `<Icon />` primitive renders a consistent family: 24×24 grid, 1.8px
stroke, round caps/joins. Presentation attributes are inherited from the parent
`<Svg>` for a uniform weight.

```tsx
import { Icon } from '../components/ui/icons';

<Icon name="wallet" size={20} color={colors.primary} />
<Icon name="bell" filled />              // solid silhouette where available
<Icon name="search" strokeWidth={2} />   // optical weight tuned by size
```

- **Canonical names** (preferred): `home, list, wallet, user, bell, search,
  settings, plus, check, x, chevron-right, trending-up, flag, lock, shield-check,
  star, flame, leaf, trophy, …` — see `paths.tsx`.
- **Legacy names** (Ionicons) are remapped through `aliases.ts`, so migrating a
  screen is usually a find-and-replace from `<Ionicons …>` to `<Icon …>` keeping
  the same `name`.
- **Solid variants** exist for emphasis (tab bar focus, filled badges). Names
  without a solid fall back to a bolder outline.
- **Categories**: `getCategoryVisual(category)` → `{ icon, tint, background }`.

To add an icon: draw it in `paths.tsx` (24×24, stroke inherits) and, if used as
a legacy name anywhere, add an entry in `aliases.ts`.

---

## Components (`src/components/ui`)

| Component | Notes |
| --- | --- |
| `AppButton` | Hierarchy: `primary, secondary, tertiary, destructive, success, text`. Sizes `sm/md/lg`, `icon`, `iconPosition`, `fullWidth`, loading/disabled, press states. Legacy `outline`→secondary, `ghost`→tertiary. |
| `IconButton` | Square tap target (`soft/ghost/solid/outline`, `sm/md/lg`). 44pt min. |
| `AppInput` | Focus/error/success states with inline SVG validation, `leadingIcon`, `hint`, password toggle. |
| `SearchInput` | Focus-animated search field with clear button. |
| `Card` | `default/outlined/primary/insight`, padding `none→xl`, `elevation`. |
| `Badge` | Status pill, tones `neutral/primary/success/warning/error/info/gold`, `solid`, optional icon. |
| `BottomSheet` | Animated slide-up modal with scrim, grab handle, titled header. |
| `SectionHeader` / `ScreenHeader` / `EmptyState` | Migrated to SVG; `EmptyState` supports `icon` (preferred) or `emoji`, and an optional action. |

Barrel import: `import { AppButton, Card, Icon } from '../components/ui';`

---

## Migration checklist (per screen)

1. Replace `import { Ionicons } …` with `import { Icon } from '…/components/ui/icons'`.
2. Swap `<Ionicons name=… />` → `<Icon name=… />` (names resolve via aliases).
3. Replace inline buttons with `<AppButton>` / `<IconButton>`.
4. Replace ad-hoc cards/pills with `<Card>` / `<Badge>`.
5. Swap hard-coded colors/sizes for tokens; apply `typography` roles to text.
6. `npx tsc --noEmit` should report no new errors.
