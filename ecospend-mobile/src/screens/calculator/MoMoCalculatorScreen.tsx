import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import FeeResultCard from '../../components/calculator/FeeResultCard';
import FeeSavingTipCard from '../../components/calculator/FeeSavingTipCard';
import LargeTransferWarning from '../../components/calculator/LargeTransferWarning';
import MoMoAmountInput from '../../components/calculator/MoMoAmountInput';
import ProviderCardRow from '../../components/calculator/ProviderCardRow';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useMoMoCalculator } from '../../hooks/useMoMoCalculator';
import { fontSize, fontWeight, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Tab utility screen for instant MoMo fee calculation.
 */
export default function MoMoCalculatorScreen() {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const {
    selectedProvider,
    setProvider,
    amount,
    setAmount,
    fee,
    totalCost,
    hasResult,
    isLargeTransfer: largeTransfer,
    providerTip,
  } = useMoMoCalculator();

  const parsedAmount = parseFloat(amount);
  const displayAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  return (
    <ScreenWrapper background="page">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Fee Calculator"
          subtitle="See MoMo fees before you send"
          onBackPress={() => navigation.goBack()}
        />

        <Text style={styles.sectionLabel}>Select provider</Text>
        <ProviderCardRow
          selectedProvider={selectedProvider}
          onSelect={setProvider}
        />

        <Text style={styles.sectionLabel}>Amount to send</Text>
        <MoMoAmountInput value={amount} onChangeText={setAmount} />
        <Text style={styles.helperText}>
          Enter the amount you want to transfer via {selectedProvider}
        </Text>

        <FeeResultCard
          hasResult={hasResult}
          amount={displayAmount}
          fee={fee}
          totalCost={totalCost}
        />

        <LargeTransferWarning visible={largeTransfer} />

        <FeeSavingTipCard tip={providerTip} />

        <Text style={styles.disclaimer}>
          Fees shown are estimates based on published schedules. Always confirm
          the final charge in your mobile money app before completing a transfer.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  sectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  disclaimer: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
