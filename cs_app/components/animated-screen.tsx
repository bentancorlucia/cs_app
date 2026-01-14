import React from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import { StyleSheet, ViewStyle } from 'react-native';
import { ClubColors } from '@/constants/theme';

type AnimationType = 'fade' | 'slide' | 'fadeDown' | 'none';

interface AnimatedScreenProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const getEnteringAnimation = (type: AnimationType, duration: number, delay: number) => {
  switch (type) {
    case 'fade':
      return FadeIn.duration(duration).delay(delay);
    case 'slide':
      return SlideInRight.duration(duration).delay(delay);
    case 'fadeDown':
      return FadeInDown.duration(duration).delay(delay);
    case 'none':
      return undefined;
    default:
      return FadeIn.duration(duration).delay(delay);
  }
};

const getExitingAnimation = (type: AnimationType, duration: number) => {
  switch (type) {
    case 'fade':
      return FadeOut.duration(duration * 0.7);
    case 'slide':
      return SlideOutLeft.duration(duration * 0.7);
    case 'fadeDown':
      return FadeOutUp.duration(duration * 0.7);
    case 'none':
      return undefined;
    default:
      return FadeOut.duration(duration * 0.7);
  }
};

export function AnimatedScreen({
  children,
  animation = 'fade',
  duration = 400,
  delay = 0,
  style,
}: AnimatedScreenProps) {
  const entering = getEnteringAnimation(animation, duration, delay);
  const exiting = getExitingAnimation(animation, duration);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[styles.container, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ClubColors.background,
  },
});
