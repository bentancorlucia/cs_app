import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Trophy, Clock, Target, Users, Calendar, User } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { ClubColors, Glass } from '@/constants/theme';

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
  const router = useRouter();
  const { profile, userRole } = useAuth();

  const roleLabels: Record<string, string> = {
    socio_social: 'Socio Social',
    socio_deportivo: 'Socio Deportivo',
    no_socio: 'No Socio',
    dt: 'Director Técnico',
    delegado: 'Delegado',
    admin: 'Administrador',
  };

  return (
    <View style={{ flex: 1, backgroundColor: ClubColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={true}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 90, paddingBottom: 40 }}
        >
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Mi Perfil</Text>
            <AnimatedPressable
              entering={FadeIn.duration(400).delay(200)}
              onPress={() => router.push('/settings')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={20} color="white" />
            </AnimatedPressable>
          </Animated.View>
        </LinearGradient>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={{ paddingHorizontal: 20, paddingVertical: 20 }}
        >
          <View
            style={{
              padding: 20,
              backgroundColor: ClubColors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  borderWidth: 2,
                  borderColor: ClubColors.secondary,
                  overflow: 'hidden',
                  marginRight: 16,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <User size={40} color={ClubColors.muted} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                  {profile?.full_name ?? mockProfile.name}
                </Text>
                <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                  {profile?.email ?? mockProfile.email}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    marginTop: 12,
                    alignSelf: 'flex-start',
                    backgroundColor: ClubColors.secondary,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: ClubColors.primary,
                    }}
                  >
                    {roleLabels[userRole ?? 'socio_deportivo'] ?? 'Socio Deportivo'}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: Glass.border,
              }}
            >
              <Calendar size={16} color={ClubColors.muted} />
              <Text style={{ color: ClubColors.muted, fontSize: 14, marginLeft: 8 }}>
                Socio desde {mockProfile.memberSince}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sport Info Card */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={{ paddingHorizontal: 20 }}
        >
          <View
            style={{
              padding: 20,
              backgroundColor: ClubColors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{'\u26bd'}</Text>
                </View>
                <View>
                  <Text style={{ color: ClubColors.secondary, fontWeight: 'bold', fontSize: 20 }}>
                    {mockProfile.sport}
                  </Text>
                  <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                    {mockProfile.division}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: ClubColors.secondary,
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: 'bold',
                    color: ClubColors.primary,
                  }}
                >
                  #{mockProfile.jerseyNumber}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                paddingTop: 20,
                gap: 32,
                borderTopWidth: 1,
                borderTopColor: Glass.border,
              }}
            >
              <View>
                <Text style={{ color: ClubColors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Categoría
                </Text>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginTop: 4 }}>{mockProfile.category}</Text>
              </View>
              <View>
                <Text style={{ color: ClubColors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Posición
                </Text>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginTop: 4 }}>{mockProfile.position}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          style={{ paddingHorizontal: 20, marginTop: 24 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Mis Estadísticas</Text>
          

          <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
            <View
              style={{
                flex: 1,
                padding: 20,
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(59, 130, 246, 0.2)',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={22} color="#3b82f6" />
              </View>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 12 }}>{mockStats.attendance}%</Text>
              <Text style={{ color: ClubColors.muted, fontSize: 14, fontWeight: '500', marginBottom: 12 }}>Asistencia</Text>
              {/* Progress Bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${mockStats.attendance}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
