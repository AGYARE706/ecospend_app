import { Animated, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useSplash } from '../../hooks/useSplash';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, fontSize, fontWeight, spacing } from '../../theme';

type SplashScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Splash'
>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const { logoOpacity, taglineOpacity } = useSplash(navigation);

  return (
    <ScreenWrapper background="white">
      <View style={styles.content}>
        <Animated.Text style={[styles.logo, { opacity: logoOpacity }]}>
          EcoSpend
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Save Smarter. Track Better. Grow Faster.
        </Animated.Text>
      </View>
      <Text style={styles.footer}>For Ghana&apos;s everyday earner</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    color: colors.primary,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  tagline: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  footer: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    paddingBottom: spacing.lg,
    textAlign: 'center',
  },
});
