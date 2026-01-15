import { Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Home, Calendar, Trophy, User } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { LiquidGlassTabBar } from '@/components/liquid-glass-tab-bar';
import { ClubColors } from '@/constants/theme';
import { useAuth } from '@/src/context/AuthContext';

export default function TabLayout() {
  const { isLoading } = useAuth();

  // Show loading spinner while auth is initializing
  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        className="flex-1 items-center justify-center bg-cs-background"
      >
        <ActivityIndicator size="large" color={ClubColors.primary} />
      </Animated.View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: ClubColors.secondary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        headerShown: true,
        headerStyle: {
          backgroundColor: ClubColors.primary,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: ClubColors.background },
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Club Seminario',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="a-la-cancha"
        options={{
          title: 'A la Cancha',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="resultados"
        options={{
          title: 'Resultados',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="mi-equipo"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
