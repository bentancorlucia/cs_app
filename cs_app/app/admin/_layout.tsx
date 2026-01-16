import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { ClubColors } from '@/constants/theme';

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, isLoading]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ClubColors.background },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="socios" />
      <Stack.Screen name="partidos" />
      <Stack.Screen name="perfiles" />
      <Stack.Screen name="asistencias" />
    </Stack>
  );
}
