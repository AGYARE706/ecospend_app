import { Animated, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useSplash } from '../../hooks/useSplash';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

type SplashScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Splash'
>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const LOGO_ASPECT_RATIO = 531 / 484;
const LOGO_WIDTH = 220;

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { logoOpacity, taglineOpacity } = useSplash(navigation);

  return (
    <ScreenWrapper background="white">
      <View style={styles.content}>
        <Animated.Image
          source={require('../../../assets/logo.png')}
          style={[styles.logo, { opacity: logoOpacity }]}
          resizeMode="contain"
          accessibilityLabel="EcoSpend"
        />
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Save Smarter. Track Better. Grow Faster.
        </Animated.Text>
      </View>
      <Text style={styles.footer}>For Ghana&apos;s everyday earner</Text>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: LOGO_WIDTH / LOGO_ASPECT_RATIO,
    marginBottom: spacing.md,
    width: LOGO_WIDTH,
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
