import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Trophy,
  Users,
  ChevronRight,
  MapPin,
  Clock,
  User,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { ClubColors, Glass } from '@/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import {
  useDisciplines,
  useUpcomingMatches,
  useUserStats,
  useClubInfo,
} from '@/src/hooks/useData';

// Club logo
const clubLogo = require('@/assets/images/logo-cs.png');

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
  'Corredores': '\uD83C\uDFC3',
  'Natacion': '\ud83c\udfca',
  'Natación': '\ud83c\udfca',
  'Tenis': '\ud83c\udfbe',
};

const getSportEmoji = (disciplineName: string) => {
  return disciplineEmojis[disciplineName] || '\u26bd';
};

const formatMatchDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Role labels for membership type display
const roleLabels: Record<string, string> = {
  socio_social: 'Socio Social',
  socio_deportivo: 'Socio Deportivo',
  no_socio: 'No Socio',
  dt: 'Director Técnico',
  delegado: 'Delegado',
  admin: 'Administrador',
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { profile, userRole } = useAuth();

  // Fetch data from database
  const { disciplines, loading: loadingDisciplines } = useDisciplines();
  const { matches, loading: loadingMatches } = useUpcomingMatches(2);
  const { stats, loading: loadingStats } = useUserStats();
  const clubInfo = useClubInfo();

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
          style={{ paddingHorizontal: 20, paddingTop: 90, paddingBottom: 56 }}
        >
          {/* Welcome and Avatar */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100)}
            className="flex-row justify-between items-start"
          >
            <View>
              <Text style={{ color: ClubColors.muted }} className="text-base font-medium">
                Hola,
              </Text>
              <Text className="text-white text-4xl font-bold tracking-tight">
                {profile?.full_name?.split(' ')[0] || 'Usuario'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/perfil')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                className="w-14 h-14 rounded-full overflow-hidden items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: ClubColors.secondary,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              >
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    className="w-full h-full"
                  />
                ) : (
                  <User size={24} color={ClubColors.muted} />
                )}
              </View>
            </Pressable>
          </Animated.View>

          {/* Club Info Card - Glassmorphism */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            className="mt-6"
          >
            <BlurView
              intensity={20}
              tint="dark"
              className="overflow-hidden"
              style={{ borderRadius: 24 }}
            >
              <View
                className="p-5 flex-row items-center"
                style={{
                  backgroundColor: Glass.card,
                  borderWidth: 1,
                  borderColor: Glass.border,
                  borderRadius: 24,
                }}
              >
                <View
                  className="items-center justify-center mr-4"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Image
                    source={clubLogo}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xl font-bold"
                    style={{ color: ClubColors.secondary }}
                  >
                    {clubInfo.name}
                  </Text>
                  <Text style={{ color: ClubColors.muted }} className="text-sm mt-1">
                    Desde {clubInfo.since} · {clubInfo.location}
                  </Text>
                  <View
                    className="mt-3 px-3 py-1.5 self-start"
                    style={{
                      backgroundColor: 'rgba(247,182,67,0.15)',
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: ClubColors.secondary }}
                    >
                      {roleLabels[userRole ?? 'no_socio'] ?? 'Miembro'}
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </LinearGradient>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', gap: 16 }}
        >
          <AnimatedPressable
            className="flex-1 overflow-hidden"
            style={{ height: 190, borderRadius: 28}}
            onPress={() => router.push('/(tabs)/a-la-cancha' as never)}
          >
            <View
              className="flex-1 p-5 justify-between"
              style={{
                backgroundColor: ClubColors.primary,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <View
                className="w-14 h-14 items-center justify-center"
                style={{ backgroundColor: 'rgba(247,182,67,0.15)', borderRadius: 16 }}
              >
                <Calendar size={28} color={ClubColors.secondary} />
              </View>
              <View>
                <Text className="text-white font-bold text-xl">A la</Text>
                <Text className="text-white font-bold text-xl -mt-1">Cancha</Text>
                <Text style={{ color: ClubColors.muted }} className="text-sm mt-2">
                  Próximos partidos
                </Text>
              </View>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            className="flex-1 overflow-hidden"
            style={{ height: 190, borderRadius: 28}}
            onPress={() => router.push('/(tabs)/mi-equipo' as never)}
          >
            <View
              className="flex-1 p-5 justify-between"
              style={{
                backgroundColor: ClubColors.surface,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <View
                className="w-14 h-14 items-center justify-center"
                style={{ backgroundColor: 'rgba(247,182,67,0.15)', borderRadius: 16 }}
              >
                <Users size={28} color={ClubColors.secondary} />
              </View>
              <View>
                <Text className="text-white font-bold text-xl">Mi</Text>
                <Text className="text-white font-bold text-xl -mt-1">Equipo</Text>
                <Text style={{ color: ClubColors.muted }} className="text-sm mt-2">
                  Compañeros
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        </Animated.View>

        {/* Upcoming Matches Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          style={{ paddingHorizontal: 20, marginTop: 16 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Próximos Partidos</Text>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(247,182,67,0.12)', borderRadius: 12 }}
              onPress={() => router.push('/(tabs)/a-la-cancha' as never)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: ClubColors.secondary, fontSize: 14, fontWeight: '500', marginRight: 4 }}>
                Ver todos
              </Text>
              <ChevronRight size={14} color={ClubColors.secondary} />
            </Pressable>
          </View>

          {loadingMatches ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={ClubColors.secondary} />
            </View>
          ) : matches.length === 0 ? (
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
              <Calendar size={40} color={ClubColors.muted} />
              <Text style={{ color: ClubColors.muted, marginTop: 12, textAlign: 'center' }}>
                No hay partidos programados
              </Text>
            </View>
          ) : (
            matches.map((match, index) => (
              <Animated.View
                key={match.id}
                entering={FadeInRight.duration(400).delay(500 + index * 100)}
              >
                <Pressable style={{ marginBottom: 16 }}>
                  <View
                    className="p-5"
                    style={{
                      backgroundColor: ClubColors.surface,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: Glass.border,
                    }}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row items-center">
                        <View
                          className="items-center justify-center mr-3"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                          }}
                        >
                          <Text className="text-2xl">
                            {getSportEmoji(match.squad?.discipline?.name || '')}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-white font-bold text-base">
                            {match.squad?.discipline?.name}
                          </Text>
                          <Text style={{ color: ClubColors.muted }} className="text-xs">
                            {match.squad?.category}
                          </Text>
                        </View>
                      </View>
                      <View
                        className="px-3 py-1.5"
                        style={{
                          backgroundColor: match.is_home ? 'rgba(59,130,246,0.2)' : 'rgba(107,114,128,0.2)',
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: match.is_home ? '#60a5fa' : '#9ca3af' }}
                        >
                          {match.is_home ? 'LOCAL' : 'VISITA'}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-4">
                      <Text className="text-white font-semibold text-base">{clubInfo.name}</Text>
                      <Text style={{ color: ClubColors.secondary }} className="font-bold text-sm my-1">
                        vs
                      </Text>
                      <Text className="text-white font-semibold text-base">{match.opponent_name}</Text>
                    </View>

                    <View
                      className="flex-row mt-4 pt-4 flex-wrap"
                      style={{ gap: 16, borderTopWidth: 1, borderTopColor: Glass.border }}
                    >
                      <View className="flex-row items-center">
                        <Calendar size={14} color={ClubColors.muted} />
                        <Text style={{ color: ClubColors.muted }} className="text-sm ml-2">
                          {formatMatchDate(match.match_date)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={14} color={ClubColors.muted} />
                        <Text style={{ color: ClubColors.muted }} className="text-sm ml-2">
                          {match.match_time}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MapPin size={14} color={ClubColors.muted} />
                        <Text style={{ color: ClubColors.muted }} className="text-sm ml-2">
                          {match.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(600)}
          style={{ paddingHorizontal: 20, marginTop: 24 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Mis Estadísticas</Text>
          <View
            className="p-5"
            style={{
              backgroundColor: ClubColors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            {loadingStats ? (
              <ActivityIndicator size="small" color={ClubColors.secondary} />
            ) : (
              <View className="flex-row justify-around">
                <View className="items-center flex-1">
                  <Text
                    style={{ color: ClubColors.secondary }}
                    className="text-3xl font-bold"
                  >
                    {stats.matchesPlayed}
                  </Text>
                  <Text style={{ color: ClubColors.muted }} className="text-xs mt-1">
                    Partidos
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text
                    style={{ color: ClubColors.secondary }}
                    className="text-3xl font-bold"
                  >
                    {stats.attendancePercentage}%
                  </Text>
                  <Text style={{ color: ClubColors.muted }} className="text-xs mt-1">
                    Asistencia
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Sports Grid */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(700)}
          style={{ paddingHorizontal: 20, marginTop: 32, marginBottom: 16 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Nuestros Deportes</Text>
          {loadingDisciplines ? (
            <ActivityIndicator size="large" color={ClubColors.secondary} />
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {disciplines.map((discipline, index) => (
                <Animated.View
                  key={discipline.id}
                  entering={FadeInUp.duration(300).delay(800 + index * 50)}
                  style={{ width: (width - 40 - 24) / 3 }}
                >
                  <Pressable>
                    <View
                      className="items-center justify-center py-5"
                      style={{
                        backgroundColor: ClubColors.surface,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: Glass.border,
                        aspectRatio: 1,
                      }}
                    >
                      <Text className="text-4xl mb-2">{getSportEmoji(discipline.name)}</Text>
                      <Text style={{ color: ClubColors.muted }} className="text-sm text-center font-medium">
                        {discipline.name}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
