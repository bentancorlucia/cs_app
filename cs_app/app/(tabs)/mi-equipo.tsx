import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Users } from 'lucide-react-native';
import { ClubColors } from '@/constants/theme';

export default function MiEquipoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cs-background">
      <View className="flex-1 items-center justify-center px-4">
        <Users size={64} color={ClubColors.secondary} />
        <Text
          className="text-2xl font-bold mt-4 text-center"
          style={{ color: ClubColors.primary }}
        >
          Mi Equipo
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Aqui podras ver la informacion de tu equipo, companeros y calendario de actividades.
        </Text>
      </View>
    </SafeAreaView>
  );
}
