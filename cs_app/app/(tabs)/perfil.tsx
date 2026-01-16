import React from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Clock, Calendar, User, Shield, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';
import { useUserSquad, useUserStats } from '@/src/hooks/useData';

// Emoji mapping for disciplines
const disciplineEmojis: Record<string, string> = {
  'Futbol': '\u26bd',
  'Fútbol': '\u26bd',
  'Basquetbol': '\ud83c\udfc0',
  'Básquetbol': '\ud83c\udfc0',
  'Basquet': '\ud83c\udfc0',
  'Rugby': '\ud83c\udfc9',
  'Handball': '\ud83e\udd3e',
  'Hockey': '\ud83c\udfd1',
  'Voleibol': '\ud83c\udfd0',
  'Voley': '\ud83c\udfd0',
};

const getSportEmoji = (disciplineName: string) => {
  return disciplineEmojis[disciplineName] || '\u26bd';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PerfilScreen() {
  const router = useRouter();
  const { profile, userRole, isAdmin } = useAuth();

  // Get user's squad and stats
  const { squad, squadMember, loading: loadingSquad } = useUserSquad();
  const { stats, loading: loadingStats } = useUserStats();

  const roleLabels: Record<string, string> = {
    socio_social: 'Socio Social',
    socio_deportivo: 'Socio Deportivo',
    no_socio: 'No Socio',
    dt: 'Director Técnico',
    delegado: 'Delegado',
    admin: 'Administrador',
  };

  // Format date for "member since"
  const formatMemberSince = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                  {profile?.full_name || 'Usuario'}
                </Text>
                <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                  {profile?.email || ''}
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
                    {roleLabels[userRole ?? 'no_socio'] ?? 'Miembro'}
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
                Socio desde {formatMemberSince(profile?.created_at)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sport Info Card */}
        {loadingSquad ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={ClubColors.secondary} />
          </View>
        ) : squad ? (
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
                    <Text style={{ fontSize: 24 }}>{getSportEmoji(squad.discipline?.name || '')}</Text>
                  </View>
                  <View>
                    <Text style={{ color: ClubColors.secondary, fontWeight: 'bold', fontSize: 20 }}>
                      {squad.discipline?.name || 'Deporte'}
                    </Text>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                      {squad.name}
                    </Text>
                  </View>
                </View>
                {squadMember?.jersey_number && (
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
                      #{squadMember.jersey_number}
                    </Text>
                  </View>
                )}
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
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginTop: 4 }}>
                    {squad.category || 'Sin categoría'}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: ClubColors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Posición
                  </Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginTop: 4 }}>
                    {squadMember?.position || 'Sin posición'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInUp.duration(500).delay(200)}
            style={{ paddingHorizontal: 20 }}
          >
            <View
              style={{
                padding: 32,
                backgroundColor: ClubColors.surface,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: Glass.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: 12 }}>{'\u26bd'}</Text>
              <Text style={{ color: ClubColors.muted, textAlign: 'center' }}>
                No estás asignado a ningún equipo
              </Text>
            </View>
          </Animated.View>
        )}

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
              {loadingStats ? (
                <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 12 }} />
              ) : (
                <>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 12 }}>
                    {stats.attendancePercentage}%
                  </Text>
                  <Text style={{ color: ClubColors.muted, fontSize: 14, fontWeight: '500', marginBottom: 12 }}>
                    Asistencia
                  </Text>
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
                        width: `${stats.attendancePercentage}%`,
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Admin Section - Only visible for admins */}
        {isAdmin && (
          <Animated.View
            entering={FadeInUp.duration(500).delay(400)}
            style={{ paddingHorizontal: 20, marginTop: 24 }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Administración
            </Text>
            <Pressable
              onPress={() => router.push('/admin')}
              style={({ pressed }) => ({
                overflow: 'hidden',
                borderRadius: BorderRadius.xl,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <LinearGradient
                colors={['rgba(115, 13, 50, 0.85)', 'rgba(90, 10, 39, 0.75)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 20,
                  borderRadius: BorderRadius.xl,
                  borderWidth: 1,
                  borderColor: 'rgba(247, 182, 67, 0.5)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: ClubColors.secondary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                    >
                      <Shield size={28} color={ClubColors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: ClubColors.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Acceso Exclusivo
                      </Text>
                      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
                        Panel de Administrador
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
                        Gestionar socios, partidos y más
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(247, 182, 67, 0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronRight size={24} color={ClubColors.secondary} />
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
