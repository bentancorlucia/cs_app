import { Stack } from 'expo-router';
import { ClubColors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ClubColors.background },
        animation: 'fade',
      }}
    />
  );
}
