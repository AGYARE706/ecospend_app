import { ScrollView, StyleSheet, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

import FilterTabRow from '../../components/finance/FilterTabRow';
import FloatingActionButton from '../../components/finance/FloatingActionButton';
import SummaryChipRow from '../../components/finance/SummaryChipRow';
import TransactionListItem from '../../components/finance/TransactionListItem';
import TransactionSectionCard from '../../components/finance/TransactionSectionCard';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SearchInput from '../../components/ui/SearchInput';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useTransactions } from '../../hooks/useTransactions';
import { navigateApp } from '../../navigation/navigationRef';
import type {
  AppStackParamList,
  TabParamList,
  TransactionsStackParamList,
} from '../../navigation/types';
import { spacing } from '../../theme';
import type { Transaction } from '../../types';

type TransactionsListNavigationProp = CompositeNavigationProp<
  StackNavigationProp<TransactionsStackParamList, 'TransactionsList'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'TransactionsTab'>,
    StackNavigationProp<AppStackParamList>
  >
>;

export default function TransactionsListScreen() {
  const navigation = useNavigation<TransactionsListNavigationProp>();
  const {
    groupedTransactions,
    activeFilter,
    setFilter,
    searchQuery,
    setSearchQuery,
    summary,
    loading,
    isEmpty,
  } = useTransactions();

  const openAddTransaction = () => {
    navigation
      .getParent<StackNavigationProp<AppStackParamList>>()
      ?.navigate('AddTransaction');
  };

  return (
    <ScreenWrapper background="page" padded={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.paddedTop}>
          <ScreenHeader
            title="Transactions"
            subtitle="Track income and spending"
            onNotificationPress={() => navigateApp('Notifications')}
            onCalculatorPress={() =>
              navigation
                .getParent<StackNavigationProp<AppStackParamList>>()
                ?.navigate('MoMoCalculator')
            }
          />

          {loading ? (
            <View>
              <SkeletonBox height={72} style={styles.skeletonGap} />
              <SkeletonBox height={36} style={styles.skeletonGap} />
              <SkeletonBox height={48} style={styles.skeletonGap} />
              <SkeletonBox height={160} />
            </View>
          ) : (
            <>
              <SummaryChipRow summary={summary} />
              <FilterTabRow activeFilter={activeFilter} onFilterChange={setFilter} />
              <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
            </>
          )}
        </View>

        {!loading && isEmpty ? (
          <EmptyState
            icon="search"
            title="No transactions found"
            subtitle="Try adjusting your search or filter"
          />
        ) : null}

        {!loading && !isEmpty ? (
          <View style={styles.paddedSections}>
            {groupedTransactions.map((section) => (
              <TransactionSectionCard key={section.title} title={section.title}>
                {section.data.map((item: Transaction, index: number) => (
                  <TransactionListItem
                    key={item.id}
                    transaction={item}
                    variant="flat"
                    showDivider={index < section.data.length - 1}
                    onPress={() =>
                      navigation.navigate('TransactionDetails', {
                        transactionId: item.id,
                      })
                    }
                  />
                ))}
              </TransactionSectionCard>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <FloatingActionButton onPress={openAddTransaction} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    // Clear the floating action button (60px + 24px offset) so the last row stays tappable.
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  paddedTop: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  paddedSections: {
    paddingHorizontal: spacing.lg,
  },
  skeletonGap: {
    marginBottom: spacing.md,
  },
});
