import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  DATE_PRESETS,
  type DatePreset,
} from '../../hooks/useCreateVault';
import {
  useCreateGroupVault,
  type MemberInvite,
} from '../../hooks/useCreateGroupVault';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

// ─── Navigation ───────────────────────────────────────────────────────────────
type CreateGroupVaultNavProp = StackNavigationProp<
  AppStackParamList,
  'CreateGroupVault'
>;

interface CreateGroupVaultScreenProps {
  navigation: CreateGroupVaultNavProp;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CreateGroupVaultScreen({
  navigation,
}: CreateGroupVaultScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    form,
    errors,
    isLoading,
    parsedTarget,
    perMemberTarget,
    daysRemaining,
    formattedDate,
    canAddMember,
    planPreview,
    setField,
    selectPreset,
    adjustMemberLimit,
    addMember,
    removeMember,
    handleCreate,
    MIN_MEMBERS,
    MAX_MEMBERS,
  } = useCreateGroupVault(navigation);

  const totalSlots = form.memberLimit;
  const filledSlots = form.members.length + 1; // +1 for creator (you)

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
            <Text style={styles.headerTitle}>Create Group Vault</Text>
            <Text style={styles.headerSub}>Digital susu for your circle</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.shieldBadge}>
              <Ionicons name="people" size={18} color={colors.primary} />
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── Educational Banner ───────────────────────────── */}
          <LinearGradient
            colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerIconRing}>
              <Ionicons name="people" size={22} color={colors.white} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Pool. Save. Achieve.</Text>
              <Text style={styles.bannerBody}>
                Create a shared vault with friends or family. Every member
                contributes and votes on withdrawals — just like susu, but digital.
              </Text>
            </View>
          </LinearGradient>

          {/* ─── Group Details ────────────────────────────────── */}
          <SectionLabel title="Group Details" icon="layers-outline" />
          <View style={styles.card}>
            <AppInput
              label="Group Name"
              value={form.groupName}
              onChangeText={(v) => setField('groupName', v)}
              placeholder="e.g. London Trip Squad, Family Pool"
              error={errors.groupName}
            />
            <View style={styles.fieldSpacer} />
            <AppInput
              label="Goal Name"
              value={form.goalName}
              onChangeText={(v) => setField('goalName', v)}
              placeholder="e.g. Europe Vacation 2026, New Office"
              error={errors.goalName}
            />
          </View>

          {/* ─── Target Amount ────────────────────────────────── */}
          <SectionLabel title="Target Amount" icon="cash-outline" />
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Total Pool Target</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencyPrefix}>GH₵</Text>
              <TextInput
                style={styles.amountInput}
                value={form.targetAmount}
                onChangeText={(v) => setField('targetAmount', v)}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.targetAmount ? (
              <Text style={styles.errorText}>{errors.targetAmount}</Text>
            ) : null}

            {parsedTarget > 0 && perMemberTarget > 0 ? (
              <View style={styles.perMemberRow}>
                <Ionicons
                  name="person-outline"
                  size={13}
                  color={colors.primary}
                />
                <Text style={styles.perMemberText}>
                  Each of {totalSlots} members contributes{' '}
                  <Text style={styles.perMemberAmount}>
                    {ghs(perMemberTarget)}
                  </Text>{' '}
                  in total
                </Text>
              </View>
            ) : null}
          </View>

          {/* ─── Contribution Frequency ───────────────────────── */}
          <SectionLabel title="Contribution Plan" icon="repeat-outline" />
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>How often do members contribute?</Text>
            <View style={styles.presetRow}>
              {(['WEEKLY', 'MONTHLY'] as const).map((cadence) => (
                <Pressable
                  key={cadence}
                  onPress={() => setField('contributionFrequency', cadence)}
                  style={[
                    styles.cadenceChip,
                    form.contributionFrequency === cadence && styles.cadenceChipActive,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: form.contributionFrequency === cadence,
                  }}
                >
                  <Text
                    style={[
                      styles.cadenceChipText,
                      form.contributionFrequency === cadence &&
                        styles.cadenceChipTextActive,
                    ]}
                  >
                    {cadence === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {planPreview ? (
              <View style={styles.perMemberRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                <Text style={styles.perMemberText}>
                  Auto plan:{' '}
                  <Text style={styles.perMemberAmount}>
                    {ghs(planPreview.instalmentAmount)}
                  </Text>{' '}
                  per member per {planPreview.cadenceLabel} ×{' '}
                  {planPreview.instalmentCount} instalments until {formattedDate}.
                  Everyone gets reminders as each date nears.
                </Text>
              </View>
            ) : (
              <Text style={styles.fieldHint}>
                Set a target amount and date to see each member's automatic
                schedule.
              </Text>
            )}
          </View>

          {/* ─── Target Date ──────────────────────────────────── */}
          <SectionLabel title="Target Date" icon="calendar-outline" />
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Lock Duration</Text>
            <View style={styles.presetRow}>
              {DATE_PRESETS.map((preset) => (
                <DateChip
                  key={preset.key}
                  preset={preset}
                  selected={form.selectedPreset === preset.key}
                  onSelect={selectPreset}
                />
              ))}
            </View>
            <View style={styles.dateDisplay}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={styles.dateValue}>{formattedDate}</Text>
              <View style={styles.daysBadge}>
                <Text style={styles.daysBadgeText}>{daysRemaining}d</Text>
              </View>
            </View>
          </View>

          {/* ─── Member Limit ─────────────────────────────────── */}
          <SectionLabel title="Member Limit" icon="people-outline" />
          <View style={styles.card}>
            <View style={styles.limitRow}>
              <View style={styles.limitLeft}>
                <Text style={styles.fieldLabel}>Max Members</Text>
                <Text style={styles.limitHint}>
                  Including yourself ({MIN_MEMBERS}–{MAX_MEMBERS} people)
                </Text>
              </View>
              <MemberStepper
                value={form.memberLimit}
                min={MIN_MEMBERS}
                max={MAX_MEMBERS}
                onDecrement={() => adjustMemberLimit(-1)}
                onIncrement={() => adjustMemberLimit(1)}
              />
            </View>

            {/* Slot progress */}
            <View style={styles.slotRow}>
              {Array.from({ length: totalSlots }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.slot,
                    i < filledSlots && styles.slotFilled,
                    i === 0 && styles.slotCreator,
                  ]}
                >
                  {i === 0 ? (
                    <Ionicons name="star" size={10} color={colors.white} />
                  ) : i < filledSlots ? (
                    <Ionicons name="checkmark" size={10} color={colors.white} />
                  ) : null}
                </View>
              ))}
            </View>
            <Text style={styles.slotMeta}>
              {filledSlots} of {totalSlots} slots filled
              {totalSlots - filledSlots > 0
                ? ` · ${totalSlots - filledSlots} open`
                : ' · Full'}
            </Text>
          </View>

          {/* ─── Invite Members ───────────────────────────────── */}
          <SectionLabel title="Invite Members" icon="person-add-outline" />
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Add by Phone Number</Text>
            <Text style={styles.fieldHint}>
              Members will receive an SMS invite to join this vault.
            </Text>

            <View style={styles.phoneRow}>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.countryChip}>
                  <Text style={styles.countryFlag}>🇬🇭</Text>
                  <Text style={styles.countryCode}>+233</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={form.phoneInput}
                  onChangeText={(v) => setField('phoneInput', v)}
                  placeholder="024 XXX XXXX"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  onSubmitEditing={addMember}
                />
              </View>
              <Pressable
                onPress={addMember}
                disabled={!canAddMember && form.members.length > 0}
                style={({ pressed }) => [
                  styles.addBtn,
                  (!canAddMember && form.members.length > 0) &&
                    styles.addBtnDisabled,
                  pressed && styles.addBtnPressed,
                ]}
              >
                <Ionicons name="add" size={20} color={colors.white} />
              </Pressable>
            </View>

            {errors.phoneInput ? (
              <Text style={styles.errorText}>{errors.phoneInput}</Text>
            ) : null}

            {!canAddMember && (
              <View style={styles.limitReachedRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={colors.warning}
                />
                <Text style={styles.limitReachedText}>
                  Member limit reached. Increase the limit above to add more.
                </Text>
              </View>
            )}

            {/* Member invite list */}
            {form.members.length > 0 ? (
              <View style={styles.memberList}>
                <View style={styles.memberListDivider} />

                {/* Creator row */}
                <MemberRow
                  initials="YOU"
                  phone="Creator (you)"
                  isCreator
                />

                {form.members.map((member, index) => (
                  <MemberRow
                    key={member.id}
                    initials={`M${index + 2}`}
                    phone={member.displayPhone}
                    onRemove={() => removeMember(member.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyMembersRow}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={colors.textLight}
                />
                <Text style={styles.emptyMembersText}>
                  No members added yet. You'll be the only member.
                </Text>
              </View>
            )}
          </View>

          {/* ─── Group Rules ──────────────────────────────────── */}
          <SectionLabel title="Group Rules" icon="shield-checkmark-outline" />
          <View style={styles.rulesCard}>
            <RuleRow
              icon="thumbs-up-outline"
              iconColor={colors.primary}
              title="Majority approval required"
              body="Any withdrawal — your own contribution only, never another member's — must be voted on and approved by a majority of active members."
            />
            <View style={styles.ruleDivider} />
            <RuleRow
              icon="alert-circle-outline"
              iconColor={colors.warning}
              title="Reaching the target early doesn't unlock it"
              body="Only the target date does. A vote can't be used to get money out before the date any cheaper than exiting early would — both cost a 5% fee."
            />
            <View style={styles.ruleDivider} />
            <RuleRow
              icon="calendar-outline"
              iconColor={colors.warning}
              title="Under-target penalty"
              body="Withdrawing on or after the target date costs 2% if the group hit its savings target, or 4% if it didn't."
            />
            <View style={styles.ruleDivider} />
            <RuleRow
              icon="lock-closed-outline"
              iconColor={colors.success}
              title="Funds remain protected"
              body="All pooled funds are secured and can only be released through a group vote."
            />
          </View>

          {/* ─── Live Summary ─────────────────────────────────── */}
          {(form.groupName.trim().length > 0 || parsedTarget > 0) ? (
            <>
              <SectionLabel title="Live Preview" icon="eye-outline" />
              <GroupSummaryPreview
                groupName={form.groupName.trim() || 'My Group'}
                goalName={form.goalName.trim() || 'Savings Goal'}
                members={form.members}
                memberLimit={form.memberLimit}
                targetAmount={parsedTarget}
                perMember={perMemberTarget}
                maturityDate={formattedDate}
                daysRemaining={daysRemaining}
              />
            </>
          ) : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ─── Sticky Footer ────────────────────────────────────── */}
        <View style={styles.footer}>
          {errors.form ? (
            <Text style={{ color: colors.error, marginBottom: 8, textAlign: 'center' }}>
              {errors.form}
            </Text>
          ) : null}
          <AppButton
            title="Create Group Vault"
            icon="people-outline"
            onPress={() => {
              void handleCreate();
            }}
            loading={isLoading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const labelStyles = useThemedStyles(createLabelStyles);
  const { colors } = useTheme();
  return (
    <View style={labelStyles.row}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={labelStyles.text}>{title}</Text>
    </View>
  );
}

const createLabelStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  text: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
});

// ─── DateChip ─────────────────────────────────────────────────────────────────
function DateChip({
  preset,
  selected,
  onSelect,
}: {
  preset: { key: DatePreset; label: string };
  selected: boolean;
  onSelect: (key: DatePreset) => void;
}) {
  const dateChipStyles = useThemedStyles(createDateChipStyles);
  return (
    <Pressable
      onPress={() => onSelect(preset.key)}
      style={({ pressed }) => [
        dateChipStyles.chip,
        selected && dateChipStyles.selected,
        pressed && dateChipStyles.pressed,
      ]}
    >
      <Text
        style={[
          dateChipStyles.label,
          selected && dateChipStyles.labelSelected,
        ]}
      >
        {preset.label}
      </Text>
    </Pressable>
  );
}

const createDateChipStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  selected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  pressed: { opacity: 0.8 },
  label: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  labelSelected: {
    color: colors.primary,
  },
});

// ─── MemberStepper ────────────────────────────────────────────────────────────
function MemberStepper({
  value,
  min,
  max,
  onDecrement,
  onIncrement,
}: {
  value: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const stepperStyles = useThemedStyles(createStepperStyles);
  const { colors } = useTheme();
  return (
    <View style={stepperStyles.row}>
      <Pressable
        onPress={onDecrement}
        disabled={value <= min}
        style={({ pressed }) => [
          stepperStyles.btn,
          value <= min && stepperStyles.btnDisabled,
          pressed && stepperStyles.btnPressed,
        ]}
      >
        <Ionicons
          name="remove"
          size={18}
          color={value <= min ? colors.textLight : colors.primary}
        />
      </Pressable>

      <View style={stepperStyles.valueBox}>
        <Text style={stepperStyles.value}>{value}</Text>
        <Text style={stepperStyles.valueSub}>people</Text>
      </View>

      <Pressable
        onPress={onIncrement}
        disabled={value >= max}
        style={({ pressed }) => [
          stepperStyles.btn,
          value >= max && stepperStyles.btnDisabled,
          pressed && stepperStyles.btnPressed,
        ]}
      >
        <Ionicons
          name="add"
          size={18}
          color={value >= max ? colors.textLight : colors.primary}
        />
      </Pressable>
    </View>
  );
}

const createStepperStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  btnDisabled: {
    backgroundColor: colors.chipBg,
    borderColor: colors.borderSubtle,
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  valueBox: {
    alignItems: 'center',
    minWidth: 52,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
  valueSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});

// ─── MemberRow ────────────────────────────────────────────────────────────────
function MemberRow({
  initials,
  phone,
  isCreator = false,
  onRemove,
}: {
  initials: string;
  phone: string;
  isCreator?: boolean;
  onRemove?: () => void;
}) {
  const memberRowStyles = useThemedStyles(createMemberRowStyles);
  const { colors } = useTheme();
  return (
    <View style={memberRowStyles.row}>
      <View
        style={[
          memberRowStyles.avatar,
          isCreator && memberRowStyles.avatarCreator,
        ]}
      >
        <Text style={memberRowStyles.initials}>{initials}</Text>
      </View>
      <View style={memberRowStyles.info}>
        <Text style={memberRowStyles.phone}>{phone}</Text>
        {isCreator ? (
          <View style={memberRowStyles.creatorBadge}>
            <Text style={memberRowStyles.creatorText}>Admin · You</Text>
          </View>
        ) : (
          <Text style={memberRowStyles.status}>Invite pending</Text>
        )}
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={spacing.sm}
          style={({ pressed }) => [
            memberRowStyles.removeBtn,
            pressed && memberRowStyles.removeBtnPressed,
          ]}
        >
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createMemberRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 38,
  },
  avatarCreator: {
    backgroundColor: colors.primaryDark,
  },
  initials: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  info: {
    flex: 1,
  },
  phone: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  status: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  creatorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  creatorText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  removeBtnPressed: {
    opacity: 0.6,
  },
});

// ─── RuleRow ──────────────────────────────────────────────────────────────────
function RuleRow({
  icon,
  iconColor,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
}) {
  const ruleStyles = useThemedStyles(createRuleStyles);
  return (
    <View style={ruleStyles.row}>
      <View
        style={[ruleStyles.iconRing, { backgroundColor: `${iconColor}18` }]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={ruleStyles.textBlock}>
        <Text style={ruleStyles.title}>{title}</Text>
        <Text style={ruleStyles.body}>{body}</Text>
      </View>
    </View>
  );
}

const createRuleStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 38,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});

// ─── GroupSummaryPreview ──────────────────────────────────────────────────────
function GroupSummaryPreview({
  groupName,
  goalName,
  members,
  memberLimit,
  targetAmount,
  perMember,
  maturityDate,
  daysRemaining,
}: {
  groupName: string;
  goalName: string;
  members: MemberInvite[];
  memberLimit: number;
  targetAmount: number;
  perMember: number;
  maturityDate: string;
  daysRemaining: number;
}) {
  const previewStyles = useThemedStyles(createPreviewStyles);
  const { colors } = useTheme();
  const totalMembers = members.length + 1; // +1 creator

  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={previewStyles.card}
    >
      <View style={previewStyles.glow} />

      {/* Top badge */}
      <View style={previewStyles.topRow}>
        <View style={previewStyles.iconRing}>
          <Ionicons name="people" size={15} color={colors.white} />
        </View>
        <View style={previewStyles.liveBadge}>
          <View style={previewStyles.liveDot} />
          <Text style={previewStyles.liveBadgeText}>Live Preview</Text>
        </View>
      </View>

      {/* Group name */}
      <Text style={previewStyles.groupName} numberOfLines={1}>
        {groupName}
      </Text>
      <Text style={previewStyles.goalName} numberOfLines={1}>
        {goalName}
      </Text>

      <View style={previewStyles.divider} />

      {/* Stats grid */}
      <View style={previewStyles.grid}>
        <PreviewStat
          icon="people-outline"
          label="Members"
          value={`${totalMembers} / ${memberLimit}`}
        />
        <PreviewStat
          icon="cash-outline"
          label="Pool Target"
          value={
            targetAmount > 0
              ? `GH₵ ${(targetAmount / 1000).toFixed(1)}k`
              : '—'
          }
        />
        <PreviewStat
          icon="person-outline"
          label="Per Member"
          value={
            perMember > 0
              ? `GH₵ ${(perMember / 1000).toFixed(1)}k`
              : '—'
          }
        />
        <PreviewStat
          icon="calendar-outline"
          label="Deadline"
          value={maturityDate.split(' ').slice(0, 2).join(' ')}
        />
        <PreviewStat
          icon="hourglass-outline"
          label="Days Left"
          value={`${daysRemaining}d`}
        />
        <PreviewStat
          icon="shield-checkmark-outline"
          label="Governance"
          value="Majority Vote"
        />
      </View>
    </LinearGradient>
  );
}

function PreviewStat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const previewStatStyles = useThemedStyles(createPreviewStatStyles);
  return (
    <View style={previewStatStyles.cell}>
      <Ionicons name={icon} size={13} color="rgba(255,255,255,0.65)" />
      <Text style={previewStatStyles.label}>{label}</Text>
      <Text style={previewStatStyles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const createPreviewStatStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  cell: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    width: '33.33%',
  },
  label: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  value: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
});

const createPreviewStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  glow: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.full,
    height: 110,
    position: 'absolute',
    right: -22,
    top: -22,
    width: 110,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 28,
  },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  liveDot: {
    backgroundColor: '#69F0AE',
    borderRadius: radius.full,
    height: 6,
    marginRight: spacing.xs,
    width: 6,
  },
  liveBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  groupName: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  goalName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 1,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
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
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  shieldBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  banner: {
    borderRadius: radius.card,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadowSm,
  },
  bannerGlow: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.full,
    height: 80,
    position: 'absolute',
    right: -14,
    top: -14,
    width: 80,
  },
  bannerIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 46,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 46,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  bannerBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadowSm,
  },
  rulesCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadowSm,
  },
  ruleDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.xs,
  },
  fieldSpacer: {
    height: spacing.md,
  },
  fieldLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  fieldHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  amountInputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginRight: spacing.sm,
  },
  amountInput: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    paddingVertical: spacing.md,
  },
  perMemberRow: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: spacing.sm,
  },
  perMemberText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  perMemberAmount: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cadenceChip: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  cadenceChipActive: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  cadenceChipText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  cadenceChipTextActive: {
    color: colors.primary,
  },
  dateDisplay: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateValue: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  daysBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  daysBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  limitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  limitLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  limitHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  slotRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slot: {
    alignItems: 'center',
    backgroundColor: colors.divider,
    borderRadius: radius.sm,
    flex: 1,
    height: 28,
    justifyContent: 'center',
    maxWidth: 32,
  },
  slotFilled: {
    backgroundColor: colors.primary,
  },
  slotCreator: {
    backgroundColor: colors.primaryDark,
  },
  slotMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  phoneInputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingRight: spacing.md,
  },
  countryChip: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRightColor: colors.borderSubtle,
    borderRightWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  countryCode: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  phoneInput: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  addBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  addBtnDisabled: {
    backgroundColor: colors.textLight,
  },
  addBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  limitReachedRow: {
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  limitReachedText: {
    color: colors.warning,
    flex: 1,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  memberList: {
    marginTop: spacing.xs,
  },
  memberListDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginBottom: spacing.sm,
  },
  emptyMembersRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emptyMembersText: {
    color: colors.textLight,
    flex: 1,
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  footer: {
    backgroundColor: colors.cardBackground,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
});
