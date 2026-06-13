import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  SPLASH_DURATION_MS,
  SPLASH_LOGO_FADE_MS,
} from '../data/mock/auth';
import type { AuthStackParamList } from '../navigation/types';

type SplashNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

export function useSplash(navigation: SplashNavigationProp) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      navigation.replace('Login');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [logoOpacity, navigation, taglineOpacity]);

  return { logoOpacity, taglineOpacity };
}
