import React from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ClubColors, Glass, BorderRadius, Spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SocialLoginButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
}

// Simple SVG-like icons as text (you can replace with actual SVG icons)
function GoogleIcon() {
  return (
    <View style={styles.iconContainer}>
      <Text style={styles.googleIcon}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.iconContainer}>
      <Text style={styles.appleIcon}></Text>
    </View>
  );
}

export function SocialLoginButton({ provider, onPress, loading }: SocialLoginButtonProps) {
  const scale = useSharedValue(1);

  // Hide Apple button on Android
  if (provider === 'apple' && Platform.OS === 'android') {
    return null;
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const label = provider === 'google' ? 'Google' : 'Apple';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
      style={[styles.button, animatedStyle]}
    >
      {provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
      <Text style={styles.text}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ClubColors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  appleIcon: {
    fontSize: 20,
    color: ClubColors.white,
  },
  text: {
    color: ClubColors.white,
    fontSize: 15,
    fontWeight: '500',
  },
});
