import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../../components/ui/icons';
import type { AuthStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { markOnboardingSeen } from '../../utils/onboardingStorage';

type OnboardingNavProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  image: ImageSourcePropType;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    image: require('../../../assets/slide1.png'),
    title: 'Every move, tracked for you',
    body: 'Top up your wallet or send money through Paystack and Mobile Money, and EcoSpend records it automatically — categorized as Food, Rent, Transport and more. No manual entry, no missed spending.',
  },
  {
    image: require('../../../assets/slide2.png'),
    title: 'Save alone, or save together',
    body: 'Lock money away in a personal Vault until a target date, or pool savings with friends in a Group Vault — a digital susu with an automatic contribution plan, reminders, and majority-vote withdrawals.',
  },
  {
    image: require('../../../assets/slide3.png'),
    title: 'Budgets that keep you honest',
    body: 'Set what you expect to earn and spend each month, then watch Weekly Insights and Month-End Projections show you — with real numbers — whether you\'re on track.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<OnboardingNavProp>();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const finish = () => {
    void markOnboardingSeen();
    navigation.replace('Login');
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
        {!isLastSlide ? (
          <Pressable onPress={finish} hitSlop={spacing.sm} accessibilityRole="button">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipSpacer} />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.slidesScroll}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={styles.slide}>
            <Image source={slide.image} style={styles.slideImage} resizeMode="contain" />

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => (isLastSlide ? finish() : goToSlide(activeIndex + 1))}
          style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.nextBtnText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Icon
            name={isLastSlide ? 'check' : 'arrow-right'}
            size={18}
            color={colors.primary}
            strokeWidth={2.2}
          />
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
    topBar: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxl,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    dot: {
      backgroundColor: 'rgba(255,255,255,0.35)',
      borderRadius: radius.full,
      height: 6,
      width: 6,
    },
    dotActive: {
      backgroundColor: colors.white,
      width: 22,
    },
    skipText: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    skipSpacer: {
      height: 20,
      width: 40,
    },
    slidesScroll: {
      flex: 1,
    },
    slide: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      width: SCREEN_WIDTH,
    },
    slideImage: {
      height: SCREEN_WIDTH * 0.8,
      marginBottom: spacing.xl,
      width: SCREEN_WIDTH * 0.8,
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
      lineHeight: 24,
      textAlign: 'center',
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
