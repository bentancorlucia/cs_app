import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Trophy,
  Users,
  ChevronRight,
  MapPin,
  Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { ClubColors } from '@/constants/theme';
import { Match } from '@/src/types/database';

// Mock user data
const mockUser = {
  name: 'Juan',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
};

// Mock club data
const mockClub = {
  name: 'Club Seminario',
  since: 2010,
  location: 'Montevideo',
  memberType: 'Socio Deportivo',
};

// Mock statistics
const mockStats = {
  goals: 12,
  assists: 8,
  matches: 18,
  attendance: 88,
};

// Mock disciplines/sports
const mockDisciplines = [
  { id: '1', name: 'Futbol', emoji: '\u26bd' },
  { id: '2', name: 'Basquetbol', emoji: '\ud83c\udfc0' },
  { id: '3', name: 'Rugby', emoji: '\ud83c\udfc9' },
  { id: '4', name: 'Handball', emoji: '\ud83e\udd3e' },
  { id: '5', name: 'Hockey', emoji: '\ud83c\udfd1' },
  { id: '6', name: 'Voleibol', emoji: '\ud83c\udfd0' },
];

// Mock upcoming matches
const mockMatches: Match[] = [
  {
    id: '1',
    squad_id: 's1',
    opponent_name: 'Club Nacional',
    match_date: '2026-01-10',
    match_time: '15:00',
    location: 'Cancha Principal',
    is_home: true,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    squad: {
      id: 's1',
      discipline_id: 'd1',
      name: 'Primera',
      category: 'mayores',
      is_active: true,
      created_at: new Date().toISOString(),
      discipline: {
        id: 'd1',
        name: 'Futbol',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    },
  },
  {
    id: '2',
    squad_id: 's2',
    opponent_name: 'Aguada',
    match_date: '2026-01-11',
    match_time: '19:30',
    location: 'Estadio Aguada',
    is_home: false,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    squad: {
      id: 's2',
      discipline_id: 'd2',
      name: 'Sub-18',
      category: 'sub-18',
      is_active: true,
      created_at: new Date().toISOString(),
      discipline: {
        id: 'd2',
        name: 'Basquetbol',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    },
  },
];

const getSportEmoji = (disciplineName: string) => {
  const map: Record<string, string> = {
    'Futbol': '\u26bd',
    'Basquetbol': '\ud83c\udfc0',
    'Basquet': '\ud83c\udfc0',
  };
  return map[disciplineName] || '\u26bd';
};

const formatMatchDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <View className="flex-1" style={{ backgroundColor: '#0d0d0d' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, '#1a0a10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="px-5 pt-14 pb-8"
        >
          {/* Welcome and Avatar */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100)}
            className="flex-row justify-between items-start"
          >
            <View>
              <Text className="text-white/60 text-base font-medium">Bienvenido,</Text>
              <Text className="text-white text-4xl font-bold tracking-tight">
                {mockUser.name}
              </Text>
            </View>
            <Pressable>
              <View
                className="w-16 h-16 rounded-full overflow-hidden"
                style={{
                  borderWidth: 3,
                  borderColor: ClubColors.secondary,
                  shadowColor: ClubColors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <Image
                  source={{ uri: mockUser.avatar }}
                  className="w-full h-full"
                />
              </View>
            </Pressable>
          </Animated.View>

          {/* Club Info Card */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            className="mt-6"
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 rounded-2xl flex-row items-center"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(247,182,67,0.3)',
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}
                className="w-18 h-18 rounded-xl items-center justify-center mr-4"
                style={{ width: 72, height: 72 }}
              >
                <Text className="text-5xl">{'\ud83d\udc3a'}</Text>
              </LinearGradient>
              <View className="flex-1">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: ClubColors.secondary }}
                >
                  {mockClub.name}
                </Text>
                <Text className="text-white/70 text-sm mt-0.5">
                  Desde {mockClub.since} · {mockClub.location}
                </Text>
                <View
                  className="mt-2 px-3 py-1 rounded-full self-start"
                  style={{ backgroundColor: 'rgba(247,182,67,0.2)' }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: ClubColors.secondary }}
                  >
                    {mockClub.memberType}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </LinearGradient>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          className="px-5 py-5 flex-row"
          style={{ gap: 12 }}
        >
          <AnimatedPressable
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ minHeight: 130 }}
            onPress={() => router.push('/(tabs)/a-la-cancha' as never)}
          >
            <LinearGradient
              colors={[ClubColors.primary, ClubColors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-4 justify-between"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(247,182,67,0.2)' }}
              >
                <Calendar size={24} color={ClubColors.secondary} />
              </View>
              <View>
                <Text className="text-white font-bold text-base">A la</Text>
                <Text className="text-white font-bold text-base -mt-1">Cancha</Text>
                <Text className="text-white/50 text-xs mt-1">Proximos partidos</Text>
              </View>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ minHeight: 130 }}
            onPress={() => router.push('/(tabs)/resultados')}
          >
            <LinearGradient
              colors={[ClubColors.primary, ClubColors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-4 justify-between"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(247,182,67,0.2)' }}
              >
                <Trophy size={24} color={ClubColors.secondary} />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Resultad</Text>
                <Text className="text-white font-bold text-base -mt-1">os</Text>
                <Text className="text-white/50 text-xs mt-1">Historial</Text>
              </View>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ minHeight: 130 }}
            onPress={() => router.push('/(tabs)/mi-equipo' as never)}
          >
            <LinearGradient
              colors={['#252525', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-4 justify-between"
              style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(247,182,67,0.15)' }}
              >
                <Users size={24} color={ClubColors.secondary} />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Mi</Text>
                <Text className="text-white font-bold text-base -mt-1">Equipo</Text>
                <Text className="text-white/50 text-xs mt-1">Companeros</Text>
              </View>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        {/* Upcoming Matches Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          className="px-5 mt-2"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Proximos Partidos</Text>
            <Pressable
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(247,182,67,0.15)' }}
              onPress={() => router.push('/(tabs)/a-la-cancha' as never)}
            >
              <Text style={{ color: ClubColors.secondary }} className="text-sm font-medium mr-1">
                Ver todos
              </Text>
              <ChevronRight size={14} color={ClubColors.secondary} />
            </Pressable>
          </View>

          {mockMatches.map((match, index) => (
            <Animated.View
              key={match.id}
              entering={FadeInRight.duration(400).delay(500 + index * 100)}
            >
              <Pressable className="mb-3">
                <LinearGradient
                  colors={[ClubColors.primary, ClubColors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4 rounded-2xl"
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
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <Text className="text-2xl">
                          {getSportEmoji(match.squad?.discipline?.name || '')}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white font-bold text-base">
                          {match.squad?.discipline?.name}
                        </Text>
                        <Text className="text-white/50 text-xs">{match.squad?.category}</Text>
                      </View>
                    </View>
                    <LinearGradient
                      colors={match.is_home ? ['#3b82f6', '#1d4ed8'] : ['#6b7280', '#4b5563']}
                      className="px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-white text-xs font-bold">
                        {match.is_home ? 'LOCAL' : 'VISITA'}
                      </Text>
                    </LinearGradient>
                  </View>

                  <View className="mt-4">
                    <Text className="text-white font-semibold text-base">{mockClub.name}</Text>
                    <Text style={{ color: ClubColors.secondary }} className="font-bold text-sm my-0.5">
                      vs
                    </Text>
                    <Text className="text-white font-semibold text-base">{match.opponent_name}</Text>
                  </View>

                  <View
                    className="flex-row mt-4 pt-3 flex-wrap"
                    style={{ gap: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <View className="flex-row items-center">
                      <Calendar size={14} color="rgba(255,255,255,0.5)" />
                      <Text className="text-white/50 text-sm ml-2">
                        {formatMatchDate(match.match_date)}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock size={14} color="rgba(255,255,255,0.5)" />
                      <Text className="text-white/50 text-sm ml-2">{match.match_time}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color="rgba(255,255,255,0.5)" />
                      <Text className="text-white/50 text-sm ml-2">{match.location}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(600)}
          className="px-5 mt-6"
        >
          <Text className="text-white text-xl font-bold mb-4">Mis Estadisticas</Text>
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
            <View className="flex-row justify-between">
              {[
                { value: mockStats.goals, label: 'Goles' },
                { value: mockStats.assists, label: 'Asistencias' },
                { value: mockStats.matches, label: 'Partidos' },
                { value: `${mockStats.attendance}%`, label: 'Asistencia' },
              ].map((stat) => (
                <View key={stat.label} className="items-center flex-1">
                  <Text
                    style={{ color: ClubColors.secondary }}
                    className="text-3xl font-bold"
                  >
                    {stat.value}
                  </Text>
                  <Text className="text-white/50 text-xs mt-1">{stat.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Sports Grid */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(700)}
          className="px-5 mt-8"
        >
          <Text className="text-white text-xl font-bold mb-4">Nuestros Deportes</Text>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {mockDisciplines.map((discipline, index) => (
              <Animated.View
                key={discipline.id}
                entering={FadeInUp.duration(300).delay(800 + index * 50)}
                style={{ width: (width - 40 - 24) / 3 }}
              >
                <Pressable>
                  <LinearGradient
                    colors={['#252525', '#1a1a1a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl items-center justify-center py-5"
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.08)',
                      aspectRatio: 1,
                    }}
                  >
                    <Text className="text-4xl mb-2">{discipline.emoji}</Text>
                    <Text className="text-white/80 text-sm text-center font-medium">
                      {discipline.name}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
