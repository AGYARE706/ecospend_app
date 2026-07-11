import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import AppButton from '../../components/ui/AppButton';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import GhsText from '../../components/ui/GhsText';
import IconButton from '../../components/ui/IconButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Icon } from '../../components/ui/icons';
import { CATEGORY_CONFIG, getCategoryVisual } from '../../constants/categories';
import { useTransactionDetails } from '../../hooks/useTransactionDetails';
import type { TransactionsStackParamList } from '../../navigation/types';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { formatGroupLabel, formatTime } from '../../utils/formatDate';

type TransactionDetailsRouteProp = RouteProp<
  TransactionsStackParamList,
  'TransactionDetails'
>;
type TransactionDetailsNavigationProp = StackNavigationProp<
  TransactionsStackParamList,
  'TransactionDetails'
>;

interface TransactionDetailsScreenProps {
  route: TransactionDetailsRouteProp;
  navigation: TransactionDetailsNavigationProp;
}

interface DetailFieldProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function DetailField({ label, value, isLast = false }: DetailFieldProps) {
  const styles = useThemedStyles(createFieldStyles);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

export default function TransactionDetailsScreen({
  route,
  navigation,
}: TransactionDetailsScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { transactionId } = route.params;
  const { transaction, isFound } = useTransactionDetails(transactionId);

  if (!isFound || !transaction) {
    return (
      <ScreenWrapper background="page" padded={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={spacing.sm}
          >
            <Icon name="chevron-left" size={22} color={colors.textDark} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction</Text>
          <View style={styles.headerSpacer} />
        </View>

        <EmptyState
          icon="receipt"
          title="Transaction not found"
          subtitle="This entry may have been removed or the link is invalid."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenWrapper>
    );
  }

  const visual = getCategoryVisual(transaction.category);
  const categoryConfig = CATEGORY_CONFIG[transaction.category];
  const isIncome = transaction.type === 'income';
  const typeLabel = isIncome ? 'Income' : 'Expense';
  const paymentLabel =
    transaction.provider ?? (isIncome ? 'Direct deposit' : 'Not specified');
  const notesLabel = transaction.notes?.trim() ? transaction.notes : 'No notes added';

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={spacing.sm}
          >
            <Icon name="chevron-left" size={22} color={colors.textDark} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction details</Text>
          <IconButton
            icon="edit"
            variant="soft"
            onPress={() =>
              navigation.navigate('EditTransaction', { transactionId: transaction.id })
            }
            accessibilityLabel="Edit transaction"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Card variant="default" padding="lg" style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors[visual.background] },
                ]}
              >
                <Icon
                  name={visual.icon}
                  size={28}
                  color={colors[visual.tint]}
                  strokeWidth={1.9}
                />
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: isIncome ? colors.success : colors.error,
                    },
                  ]}
                >
                  <Icon
                    name={isIncome ? 'arrow-down' : 'arrow-up'}
                    size={10}
                    color={colors.white}
                    strokeWidth={3}
                  />
                </View>
              </View>

              <View style={styles.heroText}>
                <Text style={styles.categoryLabel}>{categoryConfig.label}</Text>
                <View
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: isIncome
                        ? colors.successLight
                        : colors.errorLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: isIncome ? colors.success : colors.error },
                    ]}
                  >
                    {typeLabel}
                  </Text>
                </View>
              </View>
            </View>

            <GhsText
              amount={transaction.amount}
              variant={isIncome ? 'income' : 'expense'}
              size="hero"
              style={styles.amount}
              numberOfLines={1}
              adjustsFontSizeToFit
            />

            <Text style={styles.dateLine}>
              {formatGroupLabel(transaction.date)} · {formatTime(transaction.date)}
            </Text>
          </Card>

          <Card variant="default" padding="none" style={styles.detailsCard}>
            <Text style={styles.detailsHeading}>Details</Text>
            <DetailField label="Date" value={formatGroupLabel(transaction.date)} />
            <DetailField label="Time" value={formatTime(transaction.date)} />
            <DetailField label="Type" value={typeLabel} />
            <DetailField
              label="Category"
              value={`${categoryConfig.emoji} ${categoryConfig.label}`}
            />
            <DetailField label="Payment method" value={paymentLabel} />
            <DetailField label="Notes" value={notesLabel} isLast />
          </Card>

          <AppButton
            title="Edit transaction"
            variant="secondary"
            onPress={() =>
              navigation.navigate('EditTransaction', { transactionId: transaction.id })
            }
          />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const createFieldStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    rowBorder: {
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
    },
    label: {
      color: colors.textMuted,
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    value: {
      color: colors.textDark,
      flex: 1.2,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      textAlign: 'right',
    },
  });

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    backBtn: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.full,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      width: 40,
      ...cardShadow,
    },
    backBtnPressed: {
      opacity: 0.85,
    },
    headerTitle: {
      ...typography.subheading,
      color: colors.textDark,
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40,
    },
    scrollContent: {
      gap: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    heroCard: {
      ...cardShadow,
    },
    heroTop: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    iconCircle: {
      alignItems: 'center',
      borderRadius: radius.full,
      height: 64,
      justifyContent: 'center',
      marginRight: spacing.md,
      width: 64,
    },
    typeBadge: {
      alignItems: 'center',
      borderColor: colors.cardBackground,
      borderRadius: radius.full,
      borderWidth: 2,
      bottom: -2,
      height: 22,
      justifyContent: 'center',
      position: 'absolute',
      right: -2,
      width: 22,
    },
    heroText: {
      flex: 1,
      gap: spacing.xs,
    },
    categoryLabel: {
      ...typography.h2,
      color: colors.textDark,
    },
    typePill: {
      alignSelf: 'flex-start',
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    typePillText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      textTransform: 'uppercase',
    },
    amount: {
      marginBottom: spacing.sm,
    },
    dateLine: {
      ...typography.bodySm,
      color: colors.textMuted,
    },
    detailsCard: {
      ...cardShadow,
      overflow: 'hidden',
    },
    detailsHeading: {
      ...typography.label,
      color: colors.textDark,
      paddingBottom: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
  });
