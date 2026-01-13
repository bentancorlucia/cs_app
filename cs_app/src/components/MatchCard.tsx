import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { Match } from '@/src/types/database';
import { ClubColors } from '@/constants/theme';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-UY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      style={{ borderLeftWidth: 4, borderLeftColor: ClubColors.primary }}
    >
      {/* Discipline and Category */}
      <View className="flex-row items-center mb-2">
        <View
          className="px-2 py-1 rounded-full mr-2"
          style={{ backgroundColor: ClubColors.secondary }}
        >
          <Text className="text-xs font-semibold" style={{ color: ClubColors.primary }}>
            {match.squad?.discipline?.name ?? 'Disciplina'}
          </Text>
        </View>
        <Text className="text-gray-500 text-xs">
          {match.squad?.category ?? 'Categoria'}
        </Text>
      </View>

      {/* Match Info */}
      <Text className="text-lg font-bold text-gray-800 mb-1">
        {match.is_home ? 'Club Seminario' : match.opponent_name}
        <Text className="text-gray-400 font-normal"> vs </Text>
        {match.is_home ? match.opponent_name : 'Club Seminario'}
      </Text>

      {/* Date, Time, Location */}
      <View className="flex-row items-center mt-2 flex-wrap">
        <View className="flex-row items-center mr-4">
          <Calendar size={14} color="#6c757d" />
          <Text className="text-gray-500 text-sm ml-1">
            {formatDate(match.match_date)}
          </Text>
        </View>
        <View className="flex-row items-center mr-4">
          <Clock size={14} color="#6c757d" />
          <Text className="text-gray-500 text-sm ml-1">
            {match.match_time}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={14} color="#6c757d" />
          <Text className="text-gray-500 text-sm ml-1">
            {match.is_home ? 'Local' : 'Visitante'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
