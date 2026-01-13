import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Trophy, Clock, Target, Users, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/src/context/AuthContext';
import { ClubColors } from '@/constants/theme';

// Mock profile data
const mockProfile = {
  name: 'Juan Seminario',
  email: 'juan@seminario.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  memberSince: 'Marzo 2022',
  sport: 'Futbol',
  division: 'Primera Division',
  category: 'Mayores',
  position: 'Mediocampista',
  jerseyNumber: 7,
};

// Mock stats
const mockStats = {
  goals: 12,
  assists: 8,
  trophies: 3,
  attendance: 92,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PerfilScreen() {
  const { profile, userRole } = useAuth();

  const roleLabels: Record<string, string> = {
    socio_social: 'Socio Social',
    socio_deportivo: 'Socio Deportivo',
    no_socio: 'No Socio',
    dt: 'Director Tecnico',
    delegado: 'Delegado',
    admin: 'Administrador',
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[ClubColors.primary, ClubColors.primaryDark, '#1a0a10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-5 pt-14 pb-6"
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="flex-row justify-between items-center"
        >
          <Text className="text-white text-3xl font-bold">Mi Perfil</Text>
          <AnimatedPressable
            entering={FadeIn.duration(400).delay(200)}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Settings size={20} color="white" />
          </AnimatedPressable>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Profile Card */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          className="px-5 py-5"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 rounded-2xl"
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <View className="flex-row items-center">
              <View
                className="w-24 h-24 rounded-full overflow-hidden mr-4"
                style={{
                  borderWidth: 3,
                  borderColor: ClubColors.secondary,
                  shadowColor: ClubColors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Image
                  source={{ uri: mockProfile.avatar }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold">
                  {profile?.full_name ?? mockProfile.name}
                </Text>
                <Text className="text-white/50 text-sm mt-0.5">
                  {profile?.email ?? mockProfile.email}
                </Text>
                <LinearGradient
                  colors={[ClubColors.secondary, '#d4992e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-4 py-1.5 rounded-full mt-3 self-start"
                >
                  <Text
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: ClubColors.primary }}
                  >
                    {roleLabels[userRole ?? 'socio_deportivo'] ?? 'Socio Deportivo'}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            <View
              className="flex-row items-center mt-5 pt-5"
              style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}
            >
              <Calendar size={16} color="rgba(255,255,255,0.4)" />
              <Text className="text-white/40 text-sm ml-2">
                Socio desde {mockProfile.memberSince}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Sport Info Card */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          className="px-5"
        >
          <LinearGradient
            colors={[ClubColors.primary, ClubColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 rounded-2xl"
            style={{
              shadowColor: ClubColors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                >
                  <Text className="text-2xl">{'\u26bd'}</Text>
                </LinearGradient>
                <View>
                  <Text style={{ color: ClubColors.secondary }} className="font-bold text-xl">
                    {mockProfile.sport}
                  </Text>
                  <Text className="text-white/50 text-sm">
                    {mockProfile.division}
                  </Text>
                </View>
              </View>
              <LinearGradient
                colors={[ClubColors.secondary, '#d4992e']}
                className="px-4 py-3 rounded-xl"
              >
                <Text
                  className="text-3xl font-bold"
                  style={{ color: ClubColors.primary }}
                >
                  #{mockProfile.jerseyNumber}
                </Text>
              </LinearGradient>
            </View>

            <View
              className="flex-row mt-5 pt-5"
              style={{ gap: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}
            >
              <View>
                <Text className="text-white/40 text-xs uppercase tracking-wide">Categoria</Text>
                <Text className="text-white font-semibold text-base mt-1">{mockProfile.category}</Text>
              </View>
              <View>
                <Text className="text-white/40 text-xs uppercase tracking-wide">Posicion</Text>
                <Text className="text-white font-semibold text-base mt-1">{mockProfile.position}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          className="px-5 mt-6"
        >
          <Text className="text-white text-xl font-bold mb-4">Mis Estadisticas</Text>
          <View className="flex-row" style={{ gap: 12 }}>
            <LinearGradient
              colors={['#5c3d1e', '#4a3118']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-5 rounded-2xl"
              style={{
                shadowColor: ClubColors.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['rgba(247,182,67,0.3)', 'rgba(247,182,67,0.1)']}
                className="w-11 h-11 rounded-xl items-center justify-center"
              >
                <Target size={22} color={ClubColors.secondary} />
              </LinearGradient>
              <Text className="text-4xl font-bold text-white mt-3">{mockStats.goals}</Text>
              <Text className="text-white/50 text-sm font-medium">Goles</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#1e3a2f', '#163028']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-5 rounded-2xl"
              style={{
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['rgba(34,197,94,0.3)', 'rgba(34,197,94,0.1)']}
                className="w-11 h-11 rounded-xl items-center justify-center"
              >
                <Users size={22} color="#22c55e" />
              </LinearGradient>
              <Text className="text-4xl font-bold text-white mt-3">{mockStats.assists}</Text>
              <Text className="text-white/50 text-sm font-medium">Asistencias</Text>
            </LinearGradient>
          </View>

          <View className="flex-row mt-3" style={{ gap: 12 }}>
            <LinearGradient
              colors={[ClubColors.primary, ClubColors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-5 rounded-2xl"
              style={{
                shadowColor: ClubColors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['rgba(247,182,67,0.3)', 'rgba(247,182,67,0.1)']}
                className="w-11 h-11 rounded-xl items-center justify-center"
              >
                <Trophy size={22} color={ClubColors.secondary} />
              </LinearGradient>
              <Text className="text-4xl font-bold text-white mt-3">{mockStats.trophies}</Text>
              <Text className="text-white/50 text-sm font-medium">Torneos</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#1e3a5c', '#163050']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-5 rounded-2xl"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['rgba(59,130,246,0.3)', 'rgba(59,130,246,0.1)']}
                className="w-11 h-11 rounded-xl items-center justify-center"
              >
                <Clock size={22} color="#3b82f6" />
              </LinearGradient>
              <Text className="text-4xl font-bold text-white mt-3">{mockStats.attendance}%</Text>
              <Text className="text-white/50 text-sm font-medium">Asistencia</Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
