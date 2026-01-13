import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Minus, TrendingDown, Calendar, Trophy } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn, FadeInUp } from 'react-native-reanimated';
import { ClubColors } from '@/constants/theme';
import { Match } from '@/src/types/database';

// Extended Match type with scores for completed matches
interface CompletedMatch extends Match {
  home_score: number;
  away_score: number;
  league?: string;
}

// Mock completed matches
const mockResults: CompletedMatch[] = [
  {
    id: '1',
    squad_id: 's1',
    opponent_name: 'Defensor SC',
    match_date: '2026-01-03',
    match_time: '15:00',
    location: 'Cancha Principal',
    is_home: true,
    home_score: 3,
    away_score: 1,
    status: 'completed',
    league: 'Liga Metropolitana',
    created_at: new Date().toISOString(),
    squad: {
      id: 's1',
      discipline_id: 'd1',
      name: 'Mayores',
      category: 'Mayores',
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
    opponent_name: 'Liverpool',
    match_date: '2025-12-14',
    match_time: '10:00',
    location: 'Liverpool FC',
    is_home: false,
    home_score: 0,
    away_score: 2,
    status: 'completed',
    league: 'Liga Juvenil',
    created_at: new Date().toISOString(),
    squad: {
      id: 's2',
      discipline_id: 'd1',
      name: 'Sub-16',
      category: 'Sub-16',
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
    id: '3',
    squad_id: 's3',
    opponent_name: 'Trouville',
    match_date: '2025-11-24',
    match_time: '18:00',
    location: 'Club Trouville',
    is_home: false,
    home_score: 1,
    away_score: 1,
    status: 'completed',
    league: 'Liga Metropolitana',
    created_at: new Date().toISOString(),
    squad: {
      id: 's3',
      discipline_id: 'd1',
      name: 'Mayores',
      category: 'Mayores',
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
    opponent_name: 'Aguada',
    match_date: '2025-12-20',
    match_time: '19:00',
    location: 'Cancha Club Seminario',
    is_home: true,
    home_score: 78,
    away_score: 72,
    status: 'completed',
    league: 'Liga Metropolitana',
    created_at: new Date().toISOString(),
    squad: {
      id: 's4',
      discipline_id: 'd2',
      name: 'Mayores',
      category: 'Mayores',
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
    id: '5',
    squad_id: 's5',
    opponent_name: 'Carrasco Polo',
    match_date: '2025-12-10',
    match_time: '16:00',
    location: 'Carrasco Polo Club',
    is_home: false,
    home_score: 17,
    away_score: 24,
    status: 'completed',
    league: 'Torneo Apertura',
    created_at: new Date().toISOString(),
    squad: {
      id: 's5',
      discipline_id: 'd3',
      name: 'Mayores',
      category: 'Mayores',
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
  return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
};

const getMatchResult = (match: CompletedMatch): 'win' | 'draw' | 'loss' => {
  const clubScore = match.is_home ? match.home_score : match.away_score;
  const opponentScore = match.is_home ? match.away_score : match.home_score;

  if (clubScore > opponentScore) return 'win';
  if (clubScore < opponentScore) return 'loss';
  return 'draw';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ResultadosScreen() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const filteredResults = mockResults.filter((match) => {
    const disciplineMatch = selectedDiscipline === 'all' || match.squad?.discipline_id === selectedDiscipline;
    const categoryMatch = selectedCategory === 'Todas' || match.squad?.category === selectedCategory;
    return disciplineMatch && categoryMatch;
  });

  // Calculate stats for filtered results
  const stats = filteredResults.reduce(
    (acc, match) => {
      const result = getMatchResult(match);
      if (result === 'win') acc.wins++;
      else if (result === 'draw') acc.draws++;
      else acc.losses++;
      return acc;
    },
    { wins: 0, draws: 0, losses: 0 }
  );

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
          <Text className="text-white text-3xl font-bold">Historial de Resultados</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Stats Summary */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          className="px-5 py-4 flex-row"
          style={{ gap: 12 }}
        >
          <LinearGradient
            colors={['#166534', '#14532d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-4 rounded-2xl items-center"
            style={{
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <TrendingUp size={24} color="#4ade80" />
            <Text className="text-4xl font-bold text-white mt-2">{stats.wins}</Text>
            <Text className="text-green-300/70 text-sm font-medium">Victorias</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#854d0e', '#713f12']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-4 rounded-2xl items-center"
            style={{
              shadowColor: '#eab308',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Minus size={24} color="#fde047" />
            <Text className="text-4xl font-bold text-white mt-2">{stats.draws}</Text>
            <Text className="text-yellow-300/70 text-sm font-medium">Empates</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#991b1b', '#7f1d1d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-4 rounded-2xl items-center"
            style={{
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <TrendingDown size={24} color="#f87171" />
            <Text className="text-4xl font-bold text-white mt-2">{stats.losses}</Text>
            <Text className="text-red-300/70 text-sm font-medium">Derrotas</Text>
          </LinearGradient>
        </Animated.View>

        {/* Filters */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="px-5 pb-4"
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
                entering={FadeIn.duration(300).delay(250 + index * 50)}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category, index) => (
              <AnimatedPressable
                key={category}
                entering={FadeIn.duration(300).delay(300 + index * 30)}
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

        {/* Results List */}
        <View className="px-5">
          {filteredResults.length === 0 ? (
            <Animated.View
              entering={FadeIn.duration(400)}
              className="items-center py-16"
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <Trophy size={40} color="rgba(255,255,255,0.2)" />
              </View>
              <Text className="text-white/40 text-center text-base">
                No hay resultados{'\n'}con estos filtros
              </Text>
            </Animated.View>
          ) : (
            filteredResults.map((match, index) => {
              const result = getMatchResult(match);
              const resultGradient = result === 'win'
                ? ['#166534', '#14532d']
                : result === 'draw'
                ? ['#854d0e', '#713f12']
                : ['#991b1b', '#7f1d1d'];
              const borderColor = result === 'win'
                ? '#22c55e'
                : result === 'draw'
                ? '#eab308'
                : '#ef4444';
              const clubScore = match.is_home ? match.home_score : match.away_score;
              const opponentScore = match.is_home ? match.away_score : match.home_score;

              return (
                <Animated.View
                  key={match.id}
                  entering={FadeInRight.duration(400).delay(400 + index * 100)}
                >
                  <Pressable className="mb-4">
                    <LinearGradient
                      colors={[ClubColors.primary, ClubColors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-2xl overflow-hidden"
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: borderColor,
                        shadowColor: ClubColors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                      }}
                    >
                      <View className="p-5">
                        {/* Match Header */}
                        <View className="flex-row justify-between items-start mb-4">
                          <View className="flex-row items-center">
                            <LinearGradient
                              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                            >
                              <Text className="text-xl">
                                {getSportEmoji(match.squad?.discipline?.name || '')}
                              </Text>
                            </LinearGradient>
                            <View>
                              <Text className="text-white font-bold text-base">
                                {match.squad?.discipline?.name}
                              </Text>
                              <Text className="text-white/50 text-xs">
                                {match.squad?.category}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center">
                            <Calendar size={14} color="rgba(255,255,255,0.5)" />
                            <Text className="text-white/50 text-sm ml-1.5">
                              {formatMatchDate(match.match_date)}
                            </Text>
                          </View>
                        </View>

                        {/* Score Section */}
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <LinearGradient
                              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
                              className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            >
                              <Text className="text-lg">{'\ud83d\udc3a'}</Text>
                            </LinearGradient>
                            <View className="flex-1">
                              <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                                Club Seminario
                              </Text>
                            </View>
                          </View>

                          <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
                            className="px-5 py-2.5 rounded-xl mx-4"
                          >
                            <Text className="text-white text-2xl font-bold">
                              {clubScore} - {opponentScore}
                            </Text>
                          </LinearGradient>

                          <View className="flex-row items-center flex-1 justify-end">
                            <View className="flex-1 items-end mr-3">
                              <Text className="text-white font-semibold text-sm text-right" numberOfLines={1}>
                                {match.opponent_name}
                              </Text>
                            </View>
                            <LinearGradient
                              colors={resultGradient as [string, string]}
                              className="w-10 h-10 rounded-full items-center justify-center"
                            >
                              <Trophy size={18} color="white" />
                            </LinearGradient>
                          </View>
                        </View>

                        {/* League and Location */}
                        <View
                          className="flex-row justify-between items-center mt-4 pt-4"
                          style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <Text className="text-white/40 text-xs font-medium">
                            {match.league}
                          </Text>
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                          >
                            <Text className="text-white/60 text-xs font-medium">
                              {match.is_home ? 'Local' : 'Visita'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
