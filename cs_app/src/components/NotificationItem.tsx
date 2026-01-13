import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Bell, Users, Trophy, Calendar } from 'lucide-react-native';
import { Notification } from '@/src/types/database';
import { ClubColors } from '@/constants/theme';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  const iconProps = { size: 20, color: ClubColors.primary };
  switch (type) {
    case 'discipline':
      return <Trophy {...iconProps} />;
    case 'squad':
      return <Users {...iconProps} />;
    case 'match':
      return <Calendar {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} dias`;
  };

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row p-4 border-b border-gray-100 ${
        !notification.is_read ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${ClubColors.primary}15` }}
      >
        {getNotificationIcon(notification.type)}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="font-semibold text-gray-800 mb-1">
          {notification.title}
        </Text>
        <Text className="text-gray-600 text-sm" numberOfLines={2}>
          {notification.body}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {timeAgo(notification.created_at)}
        </Text>
      </View>

      {/* Unread indicator */}
      {!notification.is_read && (
        <View
          className="w-2 h-2 rounded-full self-center"
          style={{ backgroundColor: ClubColors.primary }}
        />
      )}
    </Pressable>
  );
}
