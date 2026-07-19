import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import * as financeApi from '../../api/financeApi';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import AmountDisplayInput from '../../components/finance/AmountDisplayInput';
import SetupProgressBar from '../../components/setup/SetupProgressBar';
import AppButton from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import type { AccountSetupStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type SetupIncomeNavProp = StackNavigationProp<AccountSetupStackParamList, 'SetupIncome'>;

export default function SetupIncomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<SetupIncomeNavProp>();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    const parsed = parseFloat(amount);
    if (!amount.trim() || !parsed || parsed <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }

    setSaving(true);
    try {
      await financeApi.setIncomeTarget(parsed);
      navigation.navigate('SetupBudgets');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save your income target'));
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('SetupBudgets');
  };

  return (
    <ScreenWrapper background="page" scrollable keyboardAvoiding>
      <SetupProgressBar step={1} total={3} label="Step 1 of 3" />

      <View style={styles.iconRing}>
        <Icon name="cash" size={28} color={colors.primary} strokeWidth={1.8} />
      </View>

      <Text style={styles.title}>What do you expect to earn?</Text>
      <Text style={styles.subtitle}>
        Your typical monthly income helps EcoSpend track how you're doing against what
        you actually bring in.
      </Text>

      <AmountDisplayInput value={amount} onChangeText={setAmount} error={error} />

      <View style={styles.footer}>
        <AppButton title="Continue" loading={saving} onPress={handleContinue} />
        <AppButton title="Skip for now" variant="text" onPress={handleSkip} />
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    iconRing: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      height: 56,
      justifyContent: 'center',
      marginBottom: spacing.lg,
      width: 56,
    },
    title: {
      color: colors.textDark,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: 20,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
  });
