import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { ClubColors, Glass } from '@/constants/theme';
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
          style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 }}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text className="text-white text-3xl font-bold">A la Cancha</Text>
            <Text style={{ color: ClubColors.muted, marginTop: 8 }} className="text-base">
              Próximos partidos del club
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Filters */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={{ paddingVertical: 16 }}
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
                entering={FadeIn.duration(300).delay(150 + index * 50)}
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
                entering={FadeIn.duration(300).delay(200 + index * 30)}
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

        {/* Matches List */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredMatches.length === 0 ? (
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
                <Filter size={36} color={ClubColors.muted} />
              </View>
              <Text style={{ color: ClubColors.muted, textAlign: 'center', fontSize: 16 }}>
                No hay partidos programados{'\n'}con estos filtros
              </Text>
            </Animated.View>
          ) : (
            filteredMatches.map((match, index) => (
              <Animated.View
                key={match.id}
                entering={FadeInRight.duration(400).delay(300 + index * 100)}
              >
                <Pressable style={{ marginBottom: 16 }}>
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
                          <Text style={{ fontSize: 24 }}>
                            {getSportEmoji(match.squad?.discipline?.name || '')}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                            {match.squad?.discipline?.name}
                          </Text>
                          <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                            {match.squad?.name}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          backgroundColor: match.is_home ? 'rgba(59,130,246,0.2)' : 'rgba(107,114,128,0.2)',
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            letterSpacing: 0.5,
                            color: match.is_home ? '#60a5fa' : '#9ca3af',
                          }}
                        >
                          {match.is_home ? 'LOCAL' : 'VISITA'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 16 }}>
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Club Seminario</Text>
                      <Text
                        style={{ color: ClubColors.secondary, fontWeight: 'bold', fontSize: 14, marginVertical: 4 }}
                      >
                        vs
                      </Text>
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                        {match.opponent_name}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginTop: 16,
                        paddingTop: 16,
                        gap: 16,
                        borderTopWidth: 1,
                        borderTopColor: Glass.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Calendar size={14} color={ClubColors.muted} />
                        <Text style={{ color: ClubColors.muted, fontSize: 14, marginLeft: 8 }}>
                          {formatMatchDate(match.match_date)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={14} color={ClubColors.muted} />
                        <Text style={{ color: ClubColors.muted, fontSize: 14, marginLeft: 8 }}>
                          {match.match_time}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MapPin size={14} color={ClubColors.muted} />
                        <Text style={{ color: ClubColors.muted, fontSize: 14, marginLeft: 8 }}>
                          {match.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
