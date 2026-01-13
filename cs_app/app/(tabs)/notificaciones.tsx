import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, FlatList } from 'react-native';
import { Bell } from 'lucide-react-native';
import { NotificationItem } from '@/src/components/NotificationItem';
import { Notification } from '@/src/types/database';
import { ClubColors } from '@/constants/theme';

type FilterType = 'todas' | 'mi_disciplina' | 'club';

const filterLabels: Record<FilterType, string> = {
  todas: 'Todas',
  mi_disciplina: 'Mi Disciplina',
  club: 'Club',
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Partido reprogramado',
    body: 'El partido de Futbol Sub-15 contra Nacional ha sido reprogramado para el domingo 19 a las 11:00.',
    type: 'match',
    target_type: 'squad',
    target_id: 's2',
    sender_id: 'admin1',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Entrenamiento cancelado',
    body: 'Por condiciones climaticas, el entrenamiento de hoy ha sido cancelado. Se reprogramara para la proxima semana.',
    type: 'discipline',
    target_type: 'discipline',
    target_id: 'd1',
    sender_id: 'admin1',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Cuota vencida',
    body: 'Te recordamos que tu cuota de enero esta vencida. Por favor regulariza tu situacion.',
    type: 'general',
    target_type: 'user',
    target_id: 'u1',
    sender_id: 'admin1',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Asamblea General',
    body: 'Se convoca a todos los socios a la Asamblea General Ordinaria el proximo viernes 24 a las 19:00.',
    type: 'general',
    target_type: 'all',
    sender_id: 'admin1',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NotificacionesScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  const filteredNotifications = mockNotifications.filter((notification) => {
    if (activeFilter === 'todas') return true;
    if (activeFilter === 'mi_disciplina') {
      return notification.type === 'discipline' || notification.type === 'squad';
    }
    if (activeFilter === 'club') {
      return notification.type === 'general';
    }
    return true;
  });

  const unreadCount = mockNotifications.filter((n) => !n.is_read).length;

  return (
    <SafeAreaView className="flex-1 bg-cs-background">
      {/* Header with unread count */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">
            Centro de Notificaciones
          </Text>
          {unreadCount > 0 && (
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: ClubColors.primary }}
            >
              <Text className="text-white text-xs font-semibold">
                {unreadCount} nuevas
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-3 bg-white border-b border-gray-100">
        {(Object.keys(filterLabels) as FilterType[]).map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full mr-2 ${
              activeFilter === filter ? '' : 'bg-gray-100'
            }`}
            style={activeFilter === filter ? { backgroundColor: ClubColors.primary } : {}}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter ? 'text-white' : 'text-gray-600'
              }`}
            >
              {filterLabels[filter]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => console.log('Notification pressed:', item.id)}
          />
        )}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Bell size={48} color="#ced4da" />
            <Text className="text-gray-400 text-center mt-4">
              No hay notificaciones
            </Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
