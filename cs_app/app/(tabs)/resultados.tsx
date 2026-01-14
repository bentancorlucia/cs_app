import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Minus, TrendingDown, Calendar, Swords } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn, FadeInUp } from 'react-native-reanimated';
import { ClubColors, Glass } from '@/constants/theme';
import { Match } from '@/src/types/database';
import { Image } from 'react-native';

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
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text className="text-white text-3xl font-bold">Historial de Resultados</Text>
          </Animated.View>
        </LinearGradient>

        {/* Stats Summary */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', gap: 12 }}
        >
          <View
            style={{
              flex: 1,
              padding: 16,
              alignItems: 'center',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.2)',
            }}
          >
            <TrendingUp size={24} color="#4ade80" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 8 }}>{stats.wins}</Text>
            <Text style={{ color: '#4ade80', fontSize: 14, fontWeight: '500' }}>Victorias</Text>
          </View>

          <View
            style={{
              flex: 1,
              padding: 16,
              alignItems: 'center',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(234, 179, 8, 0.2)',
            }}
          >
            <Minus size={24} color="#fde047" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 8 }}>{stats.draws}</Text>
            <Text style={{ color: '#fde047', fontSize: 14, fontWeight: '500' }}>Empates</Text>
          </View>

          <View
            style={{
              flex: 1,
              padding: 16,
              alignItems: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <TrendingDown size={24} color="#f87171" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 8 }}>{stats.losses}</Text>
            <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '500' }}>Derrotas</Text>
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={{ paddingBottom: 16 }}
        >
          {/* Discipline Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ marginBottom: 12 }}
          >
            {disciplines.map((discipline, index) => (
              <AnimatedPressable
                key={discipline.id}
                entering={FadeIn.duration(300).delay(250 + index * 50)}
                style={{ marginRight: 12 }}
                onPress={() => setSelectedDiscipline(discipline.id)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: selectedDiscipline === discipline.id
                      ? ClubColors.secondary
                      : ClubColors.surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: selectedDiscipline === discipline.id
                      ? ClubColors.secondary
                      : Glass.border,
                  }}
                >
                  {discipline.emoji && (
                    <Text style={{ marginRight: 8, fontSize: 16 }}>{discipline.emoji}</Text>
                  )}
                  <Text
                    style={{
                      fontWeight: '600',
                      color: selectedDiscipline === discipline.id
                        ? ClubColors.primary
                        : 'white',
                    }}
                  >
                    {discipline.name}
                  </Text>
                </View>
              </AnimatedPressable>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {categories.map((category, index) => (
              <AnimatedPressable
                key={category}
                entering={FadeIn.duration(300).delay(300 + index * 30)}
                style={{ marginRight: 8 }}
                onPress={() => setSelectedCategory(category)}
              >
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: selectedCategory === category
                      ? ClubColors.primary
                      : 'transparent',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selectedCategory === category
                      ? ClubColors.primary
                      : Glass.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: selectedCategory === category
                        ? 'white'
                        : ClubColors.muted,
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
        <View style={{ paddingHorizontal: 20 }}>
          {filteredResults.length === 0 ? (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={{ alignItems: 'center', paddingVertical: 64 }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: ClubColors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Swords size={36} color={ClubColors.muted} />
              </View>
              <Text style={{ color: ClubColors.muted, textAlign: 'center', fontSize: 16 }}>
                No hay resultados{'\n'}con estos filtros
              </Text>
            </Animated.View>
          ) : (
            filteredResults.map((match, index) => {
              const result = getMatchResult(match);
              const resultColor = result === 'win'
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
                  <Pressable style={{ marginBottom: 16 }}>
                    <View
                      style={{
                        backgroundColor: ClubColors.surface,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: Glass.border,
                        borderLeftWidth: 4,
                        borderLeftColor: resultColor,
                        overflow: 'hidden',
                      }}
                    >
                      <View style={{ padding: 20 }}>
                        {/* Match Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}
                            >
                              <Text style={{ fontSize: 20 }}>
                                {getSportEmoji(match.squad?.discipline?.name || '')}
                              </Text>
                            </View>
                            <View>
                              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                {match.squad?.discipline?.name}
                              </Text>
                              <Text style={{ color: ClubColors.muted, fontSize: 12, marginTop: 2 }}>
                                {match.squad?.category}
                              </Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Calendar size={14} color={ClubColors.muted} />
                            <Text style={{ color: ClubColors.muted, fontSize: 14, marginLeft: 6 }}>
                              {formatMatchDate(match.match_date)}
                            </Text>
                          </View>
                        </View>

                        {/* Score Section */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}
                            >
                              <Image
                                source={require('@/assets/images/logo-cs.png')}
                                style={{ width: 24, height: 24 }}
                                resizeMode="contain"
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                                Club Seminario
                              </Text>
                            </View>
                          </View>

                          <View
                            style={{
                              paddingHorizontal: 20,
                              paddingVertical: 10,
                              marginHorizontal: 16,
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderRadius: 14,
                            }}
                          >
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                              {clubScore} - {opponentScore}
                            </Text>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                            <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14, textAlign: 'right' }} numberOfLines={1}>
                                {match.opponent_name}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: `${resultColor}30`,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Swords size={18} color={resultColor} />
                            </View>
                          </View>
                        </View>

                        {/* League and Location */}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 16,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: Glass.border,
                          }}
                        >
                          <Text style={{ color: ClubColors.muted, fontSize: 12, fontWeight: '500' }}>
                            {match.league}
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderRadius: 10,
                            }}
                          >
                            <Text style={{ color: ClubColors.muted, fontSize: 12, fontWeight: '500' }}>
                              {match.is_home ? 'Local' : 'Visita'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
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
