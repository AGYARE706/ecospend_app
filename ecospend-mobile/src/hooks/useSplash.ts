import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  SPLASH_DURATION_MS,
  SPLASH_LOGO_FADE_MS,
} from '../data/mock/auth';
import type { AuthStackParamList } from '../navigation/types';
import { hasSeenOnboarding } from '../utils/onboardingStorage';

type SplashNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

export function useSplash(navigation: SplashNavigationProp) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: SPLASH_LOGO_FADE_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: SPLASH_LOGO_FADE_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });

    const timer = setTimeout(() => {
      void hasSeenOnboarding().then((seen) => {
        if (cancelled) {
          return;
        }
        navigation.replace(seen ? 'Login' : 'Onboarding');
      });
    }, SPLASH_DURATION_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [logoOpacity, navigation, taglineOpacity]);

  return { logoOpacity, taglineOpacity };
}
