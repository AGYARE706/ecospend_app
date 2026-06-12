import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  buildSummaryUrl,
  type TransactionSummary,
} from '../api/financeApi';
import AppButton from '../components/AppButton';
import StatCard from '../components/StatCard';
import SummarySkeleton from '../components/SummarySkeleton';
import { useFetch } from '../hooks/useFetch';
import { colors } from '../theme/colors';
import { formatGhs } from '../utils/formatCurrency';

function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleString('en-GH', { month: 'long', year: 'numeric' });
}

export default function DashboardScreen() {
  const { summaryUrl, monthLabel } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return {
      summaryUrl: buildSummaryUrl(currentMonth, currentYear),
      monthLabel: formatMonthYear(currentMonth, currentYear),
    };
  }, []);

  const { data, loading, error, refetch } =
    useFetch<TransactionSummary>(summaryUrl);

  const renderContent = () => {
    if (loading) {
      return <SummarySkeleton />;
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>
            Could not load summary. Tap to retry.
          </Text>
          <AppButton title="Retry" onPress={refetch} />
        </View>
      );
    }

    if (data && data.transactionCount === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyText}>
            No transactions yet. Start logging your spending.
          </Text>
        </View>
      );
    }

    if (data && data.transactionCount > 0) {
      const netBalanceColor =
        data.netBalance >= 0 ? colors.income : colors.expense;

      return (
        <View style={styles.cards}>
          <StatCard
            label="Total Income"
            value={formatGhs(data.totalIncome)}
            labelColor={colors.income}
            valueColor={colors.income}
          />
          <StatCard
            label="Total Expenses"
            value={formatGhs(data.totalExpense)}
            labelColor={colors.expense}
            valueColor={colors.expense}
          />
          <StatCard
            label="Net Balance"
            value={formatGhs(data.netBalance)}
            labelColor={colors.balance}
            valueColor={netBalanceColor}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.header}>{monthLabel}</Text>
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  cards: {
    gap: 16,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
