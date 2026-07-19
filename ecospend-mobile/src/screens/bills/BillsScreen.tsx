import { useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import IconButton from '../../components/ui/IconButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useBills } from '../../hooks/useBills';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  shadowSm,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { Bill } from '../../api/billsApi';

type BillsNavProp = StackNavigationProp<AppStackParamList, 'Bills'>;

interface BillsScreenProps {
  navigation: BillsNavProp;
}

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function dueLabel(bill: Bill): string {
  if (!bill.nextDueDate) {
    return '';
  }
  const due = new Date(bill.nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
}

export default function BillsScreen({ navigation }: BillsScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { bills, loading, payingId, walletBalance, refreshBills, payBill, removeBill } =
    useBills();

  useFocusEffect(
    useCallback(() => {
      void refreshBills();
    }, [refreshBills]),
  );

  const confirmDelete = (bill: Bill) => {
    Alert.alert('Delete bill?', `Remove "${bill.name}" from your bills.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void removeBill(bill) },
    ]);
  };

  const activeBills = bills.filter((bill) => bill.status === 'ACTIVE');

  return (
    <ScreenWrapper background="page">
      <ScreenHeader
        title="Bills"
        subtitle={`Paid from your wallet — ${ghs(walletBalance)} available`}
        onBackPress={() => navigation.goBack()}
        right={
          <IconButton
            icon="plus"
            variant="soft"
            onPress={() => navigation.navigate('AddBill')}
            accessibilityLabel="Add bill"
          />
        }
      />

      {loading ? (
        <View>
          <SkeletonBox height={88} style={styles.skeletonGap} />
          <SkeletonBox height={88} style={styles.skeletonGap} />
          <SkeletonBox height={88} />
        </View>
      ) : activeBills.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No bills yet"
          subtitle="Track recurring payments like Netflix or DSTV and pay them from your wallet in one tap."
          actionLabel="Add your first bill"
          onAction={() => navigation.navigate('AddBill')}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeBills.map((bill) => {
            const overdue = dueLabel(bill).startsWith('Overdue') || dueLabel(bill) === 'Due today';
            return (
              <View key={bill.id} style={styles.billCard}>
                <View style={styles.billTopRow}>
                  <View style={styles.billIconCircle}>
                    <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.billTextBlock}>
                    <Text style={styles.billName} numberOfLines={1}>
                      {bill.name}
                    </Text>
                    <Text style={styles.billMeta} numberOfLines={1}>
                      {ghs(bill.amount)} ·{' '}
                      {bill.billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'}
                    </Text>
                    <Text
                      style={[styles.billDue, overdue && styles.billDueUrgent]}
                      numberOfLines={1}
                    >
                      {dueLabel(bill)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => confirmDelete(bill)}
                    hitSlop={spacing.sm}
                    accessibilityLabel={`Delete ${bill.name}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
                <AppButton
                  title={payingId === bill.id ? 'Paying…' : `Pay ${ghs(bill.amount)}`}
                  icon="wallet-outline"
                  size="sm"
                  loading={payingId === bill.id}
                  disabled={payingId !== null}
                  onPress={() => void payBill(bill)}
                />
              </View>
            );
          })}
          <Text style={styles.footerNote}>
            Paying a bill debits your wallet, records the expense automatically,
            and moves the due date forward one cycle.
          </Text>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    skeletonGap: {
      marginBottom: spacing.md,
    },
    billCard: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1.5,
      gap: spacing.md,
      marginBottom: spacing.md,
      padding: spacing.md,
      ...shadowSm,
    },
    billTopRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
    },
    billIconCircle: {
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    billTextBlock: {
      flex: 1,
    },
    billName: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    billMeta: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      marginTop: 2,
    },
    billDue: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      marginTop: 2,
    },
    billDueUrgent: {
      color: colors.warning,
      fontWeight: fontWeight.semibold,
    },
    footerNote: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      lineHeight: 18,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
  });
