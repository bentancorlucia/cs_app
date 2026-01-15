import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/lib/supabase';
import { ClubColors } from '@/constants/theme';

// Parse hash fragment from URL (Supabase sends tokens as #access_token=...&refresh_token=...)
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

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the initial URL that opened the app
      const initialUrl = await Linking.getInitialURL();

      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let type: string | undefined;

      // Parse tokens from hash fragment
      if (initialUrl) {
        const hashParams = parseHashParams(initialUrl);
        accessToken = hashParams.access_token;
        refreshToken = hashParams.refresh_token;
        type = hashParams.type;
      }

      if (accessToken && refreshToken) {
        // Set the session using the tokens from the email link
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Error al verificar tu cuenta. Intentá de nuevo.');
          return;
        }

        // Handle based on the type of auth action
        if (type === 'recovery') {
          // Password reset flow - redirect to reset password screen
          router.replace('/auth/reset-password');
        } else {
          // Email confirmation (signup) - redirect to main app
          router.replace('/(tabs)');
        }
      } else {
        // No tokens - might be using a different flow or error
        setError('Link inválido. Solicitá un nuevo email de verificación.');
      }
    } catch (err) {
      console.error('Auth callback error:', err);
      setError('Ocurrió un error inesperado.');
    }
  };

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
        <Text
          className="text-primary text-base"
          onPress={() => router.replace('/(auth)/login')}
        >
          Volver al inicio
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color={ClubColors.primary} />
      <Text className="mt-4 text-gray-600">Verificando tu cuenta...</Text>
    </View>
  );
}
