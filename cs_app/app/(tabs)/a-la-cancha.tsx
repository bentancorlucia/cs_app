import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { ClubColors } from '@/constants/theme';
import { Match } from '@/src/types/database';

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
      name: 'Mayores',
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
  {
    id: '3',
    squad_id: 's3',
    opponent_name: 'Penarol',
    match_date: '2026-01-15',
    match_time: '16:00',
    location: 'Estadio Campeon del Siglo',
    is_home: false,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    squad: {
      id: 's3',
      discipline_id: 'd1',
      name: 'Sub-16',
      category: 'sub-16',
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
    id: '4',
    squad_id: 's4',
    opponent_name: 'Defensor SC',
    match_date: '2026-01-18',
    match_time: '10:00',
    location: 'Cancha Principal',
    is_home: true,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    squad: {
      id: 's4',
      discipline_id: 'd3',
      name: 'Mayores',
      category: 'mayores',
      is_active: true,
      created_at: new Date().toISOString(),
      discipline: {
        id: 'd3',
        name: 'Rugby',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    },
  },
];

const disciplines = [
  { id: 'all', name: 'Todos', emoji: null },
  { id: 'd1', name: 'Futbol', emoji: '\u26bd' },
  { id: 'd2', name: 'Basquetbol', emoji: '\ud83c\udfc0' },
  { id: 'd3', name: 'Rugby', emoji: '\ud83c\udfc9' },
  { id: 'd4', name: 'Handball', emoji: '\ud83e\udd3e' },
];

const categories = ['Todas', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Mayores'];

const getSportEmoji = (disciplineName: string) => {
  const map: Record<string, string> = {
    'Futbol': '\u26bd',
    'Basquetbol': '\ud83c\udfc0',
    'Basquet': '\ud83c\udfc0',
    'Rugby': '\ud83c\udfc9',
    'Handball': '\ud83e\udd3e',
  };
  return map[disciplineName] || '\u26bd';
};

const formatMatchDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]} ${date.getDate()}/${months[date.getMonth()]}`;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ALaCanchaScreen() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const filteredMatches = mockMatches.filter((match) => {
    const disciplineMatch = selectedDiscipline === 'all' || match.squad?.discipline_id === selectedDiscipline;
    const categoryMatch = selectedCategory === 'Todas' || match.squad?.category === selectedCategory.toLowerCase();
    return disciplineMatch && categoryMatch;
  });

  return (
    <View className="flex-1" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[ClubColors.primary, ClubColors.primaryDark, '#1a0a10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-5 pt-14 pb-6"
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text className="text-white text-3xl font-bold">A la Cancha</Text>
          <Text className="text-white/50 text-base mt-1">Proximos partidos del club</Text>
        </Animated.View>
      </LinearGradient>

      {/* Filters */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        className="px-5 py-4"
      >
        {/* Discipline Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {disciplines.map((discipline, index) => (
            <AnimatedPressable
              key={discipline.id}
              entering={FadeIn.duration(300).delay(150 + index * 50)}
              className="mr-2"
              onPress={() => setSelectedDiscipline(discipline.id)}
            >
              <LinearGradient
                colors={
                  selectedDiscipline === discipline.id
                    ? [ClubColors.secondary, '#d4992e']
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-2.5 rounded-full flex-row items-center"
                style={{
                  borderWidth: 1,
                  borderColor: selectedDiscipline === discipline.id
                    ? 'transparent'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                {discipline.emoji && (
                  <Text className="mr-1.5 text-base">{discipline.emoji}</Text>
                )}
                <Text
                  className="font-semibold"
                  style={{
                    color: selectedDiscipline === discipline.id
                      ? ClubColors.primary
                      : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {discipline.name}
                </Text>
              </LinearGradient>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category, index) => (
            <AnimatedPressable
              key={category}
              entering={FadeIn.duration(300).delay(200 + index * 30)}
              className="mr-2"
              onPress={() => setSelectedCategory(category)}
            >
              <View
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: selectedCategory === category
                    ? ClubColors.primary
                    : 'transparent',
                  borderWidth: 1,
                  borderColor: selectedCategory === category
                    ? ClubColors.primary
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: selectedCategory === category
                      ? 'white'
                      : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {category}
                </Text>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Matches List */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {filteredMatches.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="items-center py-16"
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <Filter size={40} color="rgba(255,255,255,0.2)" />
            </View>
            <Text className="text-white/40 text-center text-base">
              No hay partidos programados{'\n'}con estos filtros
            </Text>
          </Animated.View>
        ) : (
          filteredMatches.map((match, index) => (
            <Animated.View
              key={match.id}
              entering={FadeInRight.duration(400).delay(300 + index * 100)}
            >
              <Pressable className="mb-4">
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
                        <Text className="text-2xl">
                          {getSportEmoji(match.squad?.discipline?.name || '')}
                        </Text>
                      </LinearGradient>
                      <View>
                        <Text className="text-white font-bold text-lg">
                          {match.squad?.discipline?.name}
                        </Text>
                        <Text className="text-white/50 text-sm">
                          {match.squad?.name}
                        </Text>
                      </View>
                    </View>
                    <LinearGradient
                      colors={match.is_home ? ['#3b82f6', '#1d4ed8'] : ['#6b7280', '#4b5563']}
                      className="px-4 py-1.5 rounded-full"
                    >
                      <Text className="text-white text-xs font-bold tracking-wide">
                        {match.is_home ? 'LOCAL' : 'VISITA'}
                      </Text>
                    </LinearGradient>
                  </View>

                  <View className="mt-4">
                    <Text className="text-white font-semibold text-base">Club Seminario</Text>
                    <Text
                      style={{ color: ClubColors.secondary }}
                      className="font-bold text-sm my-0.5"
                    >
                      vs
                    </Text>
                    <Text className="text-white font-semibold text-base">
                      {match.opponent_name}
                    </Text>
                  </View>

                  <View
                    className="flex-row mt-4 pt-4 flex-wrap"
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
                      <Text className="text-white/50 text-sm ml-2">
                        {match.match_time}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color="rgba(255,255,255,0.5)" />
                      <Text className="text-white/50 text-sm ml-2">
                        {match.location}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
