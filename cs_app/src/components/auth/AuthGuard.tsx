import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { ClubColors } from '@/constants/theme';

function SplashLoadingScreen() {
  return (
    <View style={styles.splash}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.splashContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-cs.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator size="large" color={ClubColors.secondary} style={styles.loader} />
      </Animated.View>
    </View>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Not authenticated, redirect to login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Authenticated but in auth screens, redirect to main app
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return <SplashLoadingScreen />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: ClubColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ClubColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ClubColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  loader: {
    marginTop: 32,
  },
});
