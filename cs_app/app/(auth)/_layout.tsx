import { Stack } from 'expo-router';
import { ClubColors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ClubColors.background },
        animation: 'fade_from_bottom',
        animationDuration: 350,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          animation: 'fade',
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animation: 'slide_from_right',
          animationDuration: 350,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          animation: 'slide_from_right',
          animationDuration: 350,
        }}
      />
    </Stack>
  );
}
