import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  HISTORY_FILTERS,
  useVaultHistory,
  type HistoryFilter,
} from '../../hooks/useVaultHistory';
import { navigateApp } from '../../navigation/navigationRef';
import type { VaultStackParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
} from '../../theme';
import type { Vault, VaultStatus } from '../../types/vault';
import { formatVaultDate, getVaultProgress } from '../../utils/vault';

// ─── Navigation ───────────────────────────────────────────────────────────────
type VaultHistoryRouteProp = RouteProp<VaultStackParamList, 'VaultHistory'>;
type VaultHistoryNavProp = StackNavigationProp<VaultStackParamList, 'VaultHistory'>;

interface VaultHistoryScreenProps {
  route: VaultHistoryRouteProp;
  navigation: VaultHistoryNavProp;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function ghsShort(amount: number): string {
  if (amount >= 1000) {
    return `GH₵ ${(amount / 1000).toFixed(1)}k`;
  }
  return `GH₵ ${amount.toLocaleString('en-GH')}`;
}

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function statusConfig(status: VaultStatus): StatusConfig {
  switch (status) {
    case 'active':
      return { label: 'Active', color: colors.success, bg: colors.successLight, icon: 'trending-up' };
    case 'locked':
      return { label: 'Locked', color: colors.warning, bg: colors.warningLight, icon: 'lock-closed' };
    case 'matured':
      return { label: 'Matured', color: colors.blue, bg: colors.blueLight, icon: 'checkmark-circle' };
    case 'withdrawn':
      return { label: 'Withdrawn', color: colors.textGrey, bg: colors.chipBg, icon: 'arrow-up-circle' };
    case 'pending':
      return { label: 'Pending', color: colors.textMuted, bg: colors.chipBg, icon: 'time' };
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VaultHistoryScreen({
  navigation,
}: VaultHistoryScreenProps) {
  const {
    filteredVaults,
    summary,
    filterCounts,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasResults,
  } = useVaultHistory();

  function openVaultDetails(vault: Vault) {
    navigation.navigate('VaultDetails', { vaultId: vault.id });
  }

  function openWithdraw(vault: Vault) {
    navigateApp('WithdrawVault', { vaultId: vault.id });
  }

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Vault History</Text>
            <Text style={styles.headerSub}>
              {filterCounts.all} vault{filterCounts.all !== 1 ? 's' : ''} total
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── 4. Summary Section (shown at top for context) ── */}
          <SummaryBar
            totalVaults={summary.totalVaults}
            totalSaved={summary.totalSaved}
            totalFeesPaid={summary.totalFeesPaid}
          />

          {/* ─── 1. Search Bar ───────────────────────────────── */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search vaults…"
                placeholderTextColor={colors.textLight}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  onPress={clearSearch}
                  hitSlop={spacing.sm}
                  style={styles.clearBtn}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* ─── 2. Filter Chips ─────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {HISTORY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                count={filterCounts[filter.key]}
                selected={activeFilter === filter.key}
                onPress={() => setActiveFilter(filter.key as HistoryFilter)}
              />
            ))}
          </ScrollView>

          {/* ─── 3. History List ─────────────────────────────── */}
          {hasResults ? (
            <View style={styles.listWrapper}>
              {filteredVaults.map((vault, index) => (
                <VaultHistoryCard
                  key={vault.id}
                  vault={vault}
                  isLast={index === filteredVaults.length - 1}
                  onPress={() => openVaultDetails(vault)}
                  onWithdraw={
                    vault.status === 'active' || vault.status === 'matured'
                      ? () => openWithdraw(vault)
                      : undefined
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyState
              isFiltered={activeFilter !== 'all' || searchQuery.length > 0}
              onReset={() => {
                setActiveFilter('all');
                clearSearch();
              }}
            />
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

// ─── SummaryBar ───────────────────────────────────────────────────────────────
function SummaryBar({
  totalVaults,
  totalSaved,
  totalFeesPaid,
}: {
  totalVaults: number;
  totalSaved: number;
  totalFeesPaid: number;
}) {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={summaryStyles.card}
    >
      <View style={summaryStyles.glow} />

      <Text style={summaryStyles.heading}>Overview</Text>

      <View style={summaryStyles.grid}>
        <SummaryMetric
          icon="layers-outline"
          label="Total Vaults"
          value={String(totalVaults)}
        />
        <View style={summaryStyles.divider} />
        <SummaryMetric
          icon="wallet-outline"
          label="Total Saved"
          value={ghsShort(totalSaved)}
        />
        <View style={summaryStyles.divider} />
        <SummaryMetric
          icon="receipt-outline"
          label="Fees Paid"
          value={totalFeesPaid > 0 ? ghsShort(totalFeesPaid) : 'GH₵ 0'}
        />
      </View>
    </LinearGradient>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={summaryStyles.metric}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.7)" />
      <Text style={summaryStyles.metricLabel}>{label}</Text>
      <Text style={summaryStyles.metricValue}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadowMd,
  },
  glow: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    height: 100,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
  },
  heading: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.sm,
    width: 1,
  },
});

// ─── FilterChip ───────────────────────────────────────────────────────────────
function FilterChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        chipStyles.chip,
        selected && chipStyles.chipSelected,
        pressed && chipStyles.chipPressed,
      ]}
    >
      <Text
        style={[chipStyles.label, selected && chipStyles.labelSelected]}
      >
        {label}
      </Text>
      <View
        style={[chipStyles.badge, selected && chipStyles.badgeSelected]}
      >
        <Text
          style={[chipStyles.badgeText, selected && chipStyles.badgeTextSelected]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadowSm,
  },
  chipSelected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginRight: spacing.xs,
  },
  labelSelected: {
    color: colors.primary,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
  },
  badgeSelected: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.textGrey,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  badgeTextSelected: {
    color: colors.white,
  },
});

// ─── VaultHistoryCard ─────────────────────────────────────────────────────────
function VaultHistoryCard({
  vault,
  isLast,
  onPress,
  onWithdraw,
}: {
  vault: Vault;
  isLast: boolean;
  onPress: () => void;
  onWithdraw?: () => void;
}) {
  const cfg = statusConfig(vault.status);
  const progress = getVaultProgress(vault);
  const totalContributed = vault.contributions.reduce(
    (sum, c) => sum + c.amount,
    0,
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.card,
        isLast && cardStyles.cardLast,
        pressed && cardStyles.cardPressed,
      ]}
    >
      {/* ─── Top row ───────────────────────────────────────────── */}
      <View style={cardStyles.topRow}>
        {/* Accent dot + name */}
        <View style={cardStyles.nameRow}>
          <View
            style={[cardStyles.accentDot, { backgroundColor: vault.accentColor }]}
          />
          <View style={cardStyles.nameBlock}>
            <Text style={cardStyles.vaultName} numberOfLines={1}>
              {vault.name}
            </Text>
            <Text style={cardStyles.createdLabel}>
              Created {formatVaultDate(vault.createdDate)}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View style={[cardStyles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[cardStyles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>

      {/* ─── Amount row ────────────────────────────────────────── */}
      <View style={cardStyles.amountRow}>
        <View style={cardStyles.amountBlock}>
          <Text style={cardStyles.amountLabel}>
            {vault.status === 'withdrawn' ? 'Total Saved' : 'Current Balance'}
          </Text>
          <Text style={cardStyles.amountValue}>
            {vault.status === 'withdrawn'
              ? ghs(totalContributed)
              : ghs(vault.currentBalance)}
          </Text>
        </View>
        <View style={cardStyles.amountBlock}>
          <Text style={cardStyles.amountLabel}>Target</Text>
          <Text style={cardStyles.targetValue}>
            {ghs(vault.targetAmount)}
          </Text>
        </View>
      </View>

      {/* ─── Progress bar (not shown for withdrawn) ────────────── */}
      {vault.status !== 'withdrawn' ? (
        <View style={cardStyles.progressSection}>
          <View style={cardStyles.progressTrack}>
            <View
              style={[
                cardStyles.progressFill,
                {
                  backgroundColor: vault.accentColor,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={cardStyles.progressPct}>{progress}%</Text>
        </View>
      ) : null}

      {/* ─── Detail grid ───────────────────────────────────────── */}
      <View style={cardStyles.detailGrid}>
        <DetailCell
          icon="calendar-outline"
          label="Maturity"
          value={formatVaultDate(vault.maturityDate)}
        />
        {vault.withdrawalDate ? (
          <DetailCell
            icon="arrow-up-circle-outline"
            label="Withdrawn"
            value={formatVaultDate(vault.withdrawalDate)}
          />
        ) : (
          <DetailCell
            icon="layers-outline"
            label="Contributions"
            value={`${vault.contributions.length}`}
          />
        )}
        <DetailCell
          icon="receipt-outline"
          label="Fee"
          value={
            vault.status === 'withdrawn' && vault.feeCharged != null
              ? ghs(vault.feeCharged)
              : vault.estimatedWithdrawalFee > 0
                ? `~${ghs(vault.estimatedWithdrawalFee)}`
                : '—'
          }
          valueColor={
            vault.status === 'withdrawn' && (vault.feeCharged ?? 0) > 0
              ? colors.error
              : undefined
          }
        />
      </View>

      {/* ─── CTA (active/matured only) ─────────────────────────── */}
      {onWithdraw ? (
        <View style={cardStyles.ctaRow}>
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              cardStyles.ctaOutline,
              pressed && cardStyles.ctaPressed,
            ]}
          >
            <Text style={cardStyles.ctaOutlineText}>View Details</Text>
          </Pressable>
          <Pressable
            onPress={onWithdraw}
            style={({ pressed }) => [
              cardStyles.ctaPrimary,
              pressed && cardStyles.ctaPressed,
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={14}
              color={colors.white}
              style={cardStyles.ctaIcon}
            />
            <Text style={cardStyles.ctaPrimaryText}>Withdraw</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

function DetailCell({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={detailStyles.cell}>
      <View style={detailStyles.iconRow}>
        <Ionicons name={icon} size={12} color={colors.textMuted} />
        <Text style={detailStyles.label}>{label}</Text>
      </View>
      <Text
        style={[detailStyles.value, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  iconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    marginLeft: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowSm,
  },
  cardLast: {
    marginBottom: 0,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  nameRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  accentDot: {
    borderRadius: radius.full,
    height: 10,
    marginRight: spacing.sm,
    width: 10,
  },
  nameBlock: {
    flex: 1,
  },
  vaultName: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  createdLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginLeft: 3,
  },
  amountRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  amountBlock: {
    flex: 1,
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  amountValue: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  targetValue: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  progressSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  progressTrack: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    flex: 1,
    height: 6,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: 6,
  },
  progressPct: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    width: 32,
    textAlign: 'right',
  },
  detailGrid: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  ctaRow: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  ctaOutline: {
    alignItems: 'center',
    borderColor: colors.borderSubtle,
    borderRadius: radius.button,
    borderWidth: 1.5,
    flex: 1,
    height: 38,
    justifyContent: 'center',
  },
  ctaPrimary: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    flex: 1,
    flexDirection: 'row',
    height: 38,
    justifyContent: 'center',
  },
  ctaIcon: {
    marginRight: spacing.xs,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaOutlineText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  ctaPrimaryText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({
  isFiltered,
  onReset,
}: {
  isFiltered: boolean;
  onReset: () => void;
}) {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconRing}>
        <Ionicons name="search" size={28} color={colors.textMuted} />
      </View>
      <Text style={emptyStyles.title}>
        {isFiltered ? 'No vaults found' : 'No vaults yet'}
      </Text>
      <Text style={emptyStyles.body}>
        {isFiltered
          ? 'Try adjusting your search or filter.'
          : 'Create your first vault to start saving.'}
      </Text>
      {isFiltered ? (
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            emptyStyles.resetBtn,
            pressed && emptyStyles.resetBtnPressed,
          ]}
        >
          <Text style={emptyStyles.resetBtnText}>Clear filters</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 72,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  resetBtn: {
    borderColor: colors.primary,
    borderRadius: radius.button,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resetBtnPressed: {
    opacity: 0.7,
  },
  resetBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchWrapper: {
    marginBottom: spacing.md,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: spacing.md,
    ...shadowSm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.sm,
  },
  clearBtn: {
    marginLeft: spacing.sm,
  },
  filterRow: {
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  listWrapper: {
    paddingBottom: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
