import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../../components/ui/icons';
import type { IconName } from '../../components/ui/icons';
import { useAuth } from '../../context/AuthContext';
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

type SetupWelcomeNavProp = StackNavigationProp<AccountSetupStackParamList, 'SetupWelcome'>;

interface Step {
  icon: IconName;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: 'cash',
    title: 'Expected income',
    body: 'Tell us what you typically earn each month.',
  },
  {
    icon: 'target',
    title: 'Monthly budgets',
    body: 'Set spending limits for the categories that matter to you.',
  },
  {
    icon: 'bell',
    title: 'Notifications',
    body: 'Choose what EcoSpend should keep you posted on.',
  },
];

export default function SetupWelcomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<SetupWelcomeNavProp>();
  const { user } = useAuth();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.iconRingOuter}>
          <View style={styles.iconRingInner}>
            <Icon name="sparkles" size={40} color={colors.white} strokeWidth={1.6} />
          </View>
        </View>

        <Text style={styles.title}>
          {user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : 'Welcome!'}
        </Text>
        <Text style={styles.body}>
          Let's get your account ready. This takes less than a minute.
        </Text>

        <View style={styles.stepsList}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepIconRing}>
                <Icon name={step.icon} size={18} color={colors.white} strokeWidth={1.8} />
              </View>
              <View style={styles.stepTextBlock}>
                <Text style={styles.stepTitle}>
                  {index + 1}. {step.title}
                </Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => navigation.navigate('SetupIncome')}
          style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.nextBtnText}>Get Started</Text>
          <Icon name="arrow-right" size={18} color={colors.primary} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    iconRingOuter: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: radius.full,
      height: 120,
      justifyContent: 'center',
      marginBottom: spacing.xl,
      width: 120,
    },
    iconRingInner: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: radius.full,
      height: 80,
      justifyContent: 'center',
      width: 80,
    },
    title: {
      color: colors.white,
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    body: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: fontSize.md,
      lineHeight: 22,
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
    stepsList: {
      gap: spacing.lg,
    },
    stepRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
    },
    stepIconRing: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: radius.full,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    stepTextBlock: {
      flex: 1,
    },
    stepTitle: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      marginBottom: 2,
    },
    stepBody: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSize.sm,
      lineHeight: 18,
    },
    footer: {
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    nextBtn: {
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: radius.button,
      flexDirection: 'row',
      gap: spacing.sm,
      height: 56,
      justifyContent: 'center',
    },
    nextBtnPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    nextBtnText: {
      color: colors.primary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
  });
