import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Bell } from 'lucide-react-native';
import { NotificationItem } from '@/src/components/NotificationItem';
import { ClubColors } from '@/constants/theme';
import { useNotifications } from '@/src/hooks/useData';

type FilterType = 'todas' | 'mi_disciplina' | 'club';

const filterLabels: Record<FilterType, string> = {
  todas: 'Todas',
  mi_disciplina: 'Mi Disciplina',
  club: 'Club',
};

export default function NotificacionesScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  // Fetch notifications from database
  const { notifications, loading, markAsRead } = useNotifications();

  // Filter notifications based on selected filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeFilter === 'todas') return true;
      if (activeFilter === 'mi_disciplina') {
        return notification.type === 'discipline' || notification.type === 'squad' || notification.type === 'match';
      }
      if (activeFilter === 'club') {
        return notification.type === 'general';
      }
      return true;
    });
  }, [notifications, activeFilter]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const handleNotificationPress = (notificationId: string) => {
    markAsRead(notificationId);
  };

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
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={ClubColors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item.id)}
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
      )}
    </SafeAreaView>
  );
}
