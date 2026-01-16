import { useEffect, useState, useCallback } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { AuthGuard } from '@/src/components/auth';
import { AnimatedSplash } from '@/src/components/AnimatedSplash';
import { ClubColors } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Handle auth redirects from web browser
WebBrowser.maybeCompleteAuthSession();

// Custom theme with Club Seminario colors
const ClubLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ClubColors.primary,
    background: ClubColors.background,
  },
};

const ClubDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ClubColors.secondary,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

// Parse hash fragment from URL
const parseHashParams = (url: string): Record<string, string> => {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};

  const hash = url.substring(hashIndex + 1);
  const params: Record<string, string> = {};

  hash.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });

  return params;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  const onSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Hide native splash when app is ready
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Handle deep links when app is already open
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      const hashParams = parseHashParams(event.url);
      console.log('🔗 Hash params:', hashParams);

      if (hashParams.access_token && hashParams.refresh_token) {
        console.log('🔗 Setting session...');
        const { error } = await supabase.auth.setSession({
          access_token: hashParams.access_token,
          refresh_token: hashParams.refresh_token,
        });

        if (error) {
          console.log('🔗 Session error:', error);
        } else if (hashParams.type === 'recovery') {
          console.log('🔗 Redirecting to reset-password');
          router.push('/auth/reset-password');
        }
      }
    };

    // Handle initial URL (app opened from link)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log('🔗 Initial URL:', initialUrl);
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    handleInitialURL();

    // Listen for URL changes while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Listen for Supabase auth events
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        console.log('🔗 Auth event:', event);
        if (event === 'PASSWORD_RECOVERY') {
          router.push('/auth/reset-password');
        }
      }
    );

    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? ClubDarkTheme : ClubLightTheme}>
        {showSplash && <AnimatedSplash onAnimationComplete={onSplashComplete} />}
        <AuthGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: ClubColors.background },
              animation: 'fade',
              animationDuration: 300,
            }}
          >
            <Stack.Screen
              name="(auth)"
              options={{
                animation: 'fade',
                animationDuration: 300,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                animation: 'fade',
                animationDuration: 300,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                animation: 'fade',
                animationDuration: 300,
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: 'Modal',
                animation: 'slide_from_bottom',
                animationDuration: 350,
              }}
            />
            <Stack.Screen
              name="change-password"
              options={{
                animation: 'slide_from_right',
                animationDuration: 300,
              }}
            />
            <Stack.Screen
              name="admin"
              options={{
                animation: 'slide_from_right',
                animationDuration: 300,
              }}
            />
          </Stack>
        </AuthGuard>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
