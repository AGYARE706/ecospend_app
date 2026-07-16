import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AddEnvelopeSheet from '../../components/envelopes/AddEnvelopeSheet';
import BudgetHeroCard from '../../components/envelopes/BudgetHeroCard';
import ExpectedIncomeCard from '../../components/envelopes/ExpectedIncomeCard';
import EditEnvelopeSheet from '../../components/envelopes/EditEnvelopeSheet';
import EnvelopeCard from '../../components/envelopes/EnvelopeCard';
import EnvelopeFilterRow from '../../components/envelopes/EnvelopeFilterRow';
import EnvelopeToast from '../../components/envelopes/EnvelopeToast';
import FloatingActionButton from '../../components/finance/FloatingActionButton';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useBudgetEnvelopes } from '../../hooks/useBudgetEnvelopes';
import { fontSize, spacing, fontWeight, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import { getEmptyFilterMessage } from '../../utils/envelopes';
import type { Envelope } from '../../types';

/**
 * Monthly budget dashboard with filterable envelope cards and add/edit sheets.
 */
export default function BudgetEnvelopesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const {
    filteredEnvelopes,
    activeFilter,
    setFilter,
    statusCounts,
    totalLimit,
    totalSpent,
    totalRemaining,
    overallPercent,
    currentMonthLabel,
    loading,
    addEnvelope,
    editEnvelope,
    toastMessage,
    isSaving,
    hasCategoryThisMonth,
    refreshEnvelopes,
  } = useBudgetEnvelopes();

  // currentSpend changes server-side any time the user spends in a
  // tracked category elsewhere in the app — refetch on every visit so
  // this screen never shows a stale spend total.
  useFocusEffect(
    useCallback(() => {
      void refreshEnvelopes();
    }, [refreshEnvelopes]),
  );

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editEnvelopeState, setEditEnvelopeState] = useState<Envelope | null>(null);

  const emptyMessage = useMemo(
    () => getEmptyFilterMessage(activeFilter),
    [activeFilter],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <ScreenHeader
          title="Monthly Budget"
          subtitle="Plan expected income and spending limits"
          onBackPress={() => navigation.goBack()}
          right={
            <View style={styles.monthNav}>
              <Pressable style={styles.chevronButton}>
                <Ionicons name="chevron-back" size={fontSize.lg} color={colors.textLight} />
              </Pressable>
              <Text style={styles.monthLabel}>{currentMonthLabel}</Text>
              <Pressable style={styles.chevronButton}>
                <Ionicons name="chevron-forward" size={fontSize.lg} color={colors.textLight} />
              </Pressable>
            </View>
          }
        />

        {loading ? (
          <SkeletonBox height={180} style={styles.skeletonGap} />
        ) : (
          <BudgetHeroCard
            totalLimit={totalLimit}
            totalSpent={totalSpent}
            totalRemaining={totalRemaining}
            overallPercent={overallPercent}
          />
        )}

        {loading ? null : <ExpectedIncomeCard />}

        <EnvelopeFilterRow
          activeFilter={activeFilter}
          statusCounts={statusCounts}
          onFilterChange={setFilter}
        />
      </View>
    ),
    [
      activeFilter,
      colors.textLight,
      currentMonthLabel,
      loading,
      navigation,
      overallPercent,
      setFilter,
      statusCounts,
      styles.chevronButton,
      styles.headerContainer,
      styles.monthLabel,
      styles.monthNav,
      styles.skeletonGap,
      totalLimit,
      totalRemaining,
      totalSpent,
    ],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Envelope; index: number }) => (
      <View style={styles.itemContainer}>
        <EnvelopeCard
          envelope={item}
          index={index}
          onEdit={setEditEnvelopeState}
        />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Envelope) => item.id, []);

  return (
    <ScreenWrapper background="page" padded={false}>
      {toastMessage ? <EnvelopeToast message={toastMessage} /> : null}

      <FlatList
        style={styles.list}
        data={loading ? [] : filteredEnvelopes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="pie-chart"
              title={emptyMessage.title}
              subtitle={emptyMessage.subtitle}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={() => setShowAddSheet(true)} />

      <AddEnvelopeSheet
        visible={showAddSheet}
        loading={isSaving}
        hasCategoryThisMonth={hasCategoryThisMonth}
        onClose={() => setShowAddSheet(false)}
        onSave={addEnvelope}
      />

      <EditEnvelopeSheet
        visible={editEnvelopeState !== null}
        envelope={editEnvelopeState}
        loading={isSaving}
        onClose={() => setEditEnvelopeState(null)}
        onSave={editEnvelope}
      />
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  chevronButton: {
    padding: spacing.xs,
  },
  monthLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginHorizontal: spacing.xs,
  },
  skeletonGap: {
    marginBottom: spacing.lg,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  itemContainer: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
});
