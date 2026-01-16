import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { ClubColors, Glass } from '@/constants/theme';
import { useUpcomingMatches, useDisciplines, useCategories, useClubInfo } from '@/src/hooks/useData';

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
  return `${days[date.getDay()]} ${date.getDate()}/${months[date.getMonth()]}`;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ALaCanchaScreen() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Fetch data from database
  const { matches, loading: loadingMatches } = useUpcomingMatches();
  const { disciplines, loading: loadingDisciplines } = useDisciplines();
  const { categories, loading: loadingCategories } = useCategories(selectedDiscipline);
  const clubInfo = useClubInfo();

  // Reset category when discipline changes and selected category is no longer available
  useMemo(() => {
    if (selectedCategory !== 'Todas' && !categories.includes(selectedCategory)) {
      setSelectedCategory('Todas');
    }
  }, [categories, selectedCategory]);

  // Build discipline filter options
  const disciplineOptions = useMemo(() => {
    const options = [{ id: 'all', name: 'Todos', emoji: null as string | null }];
    disciplines.forEach(d => {
      options.push({
        id: d.id,
        name: d.name,
        emoji: getSportEmoji(d.name),
      });
    });
    return options;
  }, [disciplines]);

  // Filter matches based on selected filters
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const disciplineMatch = selectedDiscipline === 'all' || match.squad?.discipline_id === selectedDiscipline;
      const categoryMatch = selectedCategory === 'Todas' ||
        match.squad?.category?.toLowerCase() === selectedCategory.toLowerCase();
      return disciplineMatch && categoryMatch;
    });
  }, [matches, selectedDiscipline, selectedCategory]);

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
            {loadingDisciplines ? (
              <ActivityIndicator size="small" color={ClubColors.secondary} />
            ) : (
              disciplineOptions.map((discipline, index) => (
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
              ))
            )}
          </ScrollView>

          {/* Category Filter - only show when a specific discipline is selected and has multiple categories */}
          {selectedDiscipline !== 'all' && categories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {loadingCategories ? (
                <ActivityIndicator size="small" color={ClubColors.secondary} />
              ) : (
                ['Todas', ...categories].map((category, index) => (
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
                ))
              )}
            </ScrollView>
          )}
        </Animated.View>

        {/* Matches List */}
        <View style={{ paddingHorizontal: 20 }}>
          {loadingMatches ? (
            <View style={{ padding: 64, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={ClubColors.secondary} />
            </View>
          ) : filteredMatches.length === 0 ? (
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
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{clubInfo.name}</Text>
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
