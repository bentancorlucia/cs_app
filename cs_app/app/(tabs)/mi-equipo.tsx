import React from 'react';
import { View, Text, ScrollView, Image, Pressable, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Mail, Phone } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ClubColors, Glass } from '@/constants/theme';

// Mock team members
const mockTeamMembers = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    position: 'Delantero',
    number: 9,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Miguel Fernandez',
    position: 'Mediocampista',
    number: 10,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Diego Martinez',
    position: 'Defensor',
    number: 4,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '4',
    name: 'Lucas Perez',
    position: 'Arquero',
    number: 1,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  },
];

// Mock staff
const mockStaff = [
  {
    id: '1',
    name: 'Roberto Sanchez',
    role: 'Director Técnico',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    email: 'roberto.sanchez@clubseminario.com',
    phone: '+598 99 123 456',
  },
  {
    id: '2',
    name: 'Ana Garcia',
    role: 'Delegada',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    email: 'ana.garcia@clubseminario.com',
    phone: '+598 99 654 321',
  },
];

const handleContact = async (type: 'email' | 'phone', value: string) => {
  const url = type === 'email' ? `mailto:${value}` : `tel:${value.replace(/\s/g, '')}`;
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Error', `No se puede abrir ${type === 'email' ? 'el correo' : 'el teléfono'}`);
  }
};

export default function MiEquipoScreen() {
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
            <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Mi Equipo</Text>
            <Text style={{ color: ClubColors.muted, fontSize: 16, marginTop: 8 }}>
              Futbol - Mayores
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Team Stats */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', gap: 12 }}
        >
          <View
            style={{
              flex: 1,
              padding: 16,
              alignItems: 'center',
              backgroundColor: ClubColors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <Users size={24} color={ClubColors.secondary} />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 8 }}>
              {mockTeamMembers.length}
            </Text>
            <Text style={{ color: ClubColors.muted, fontSize: 14, fontWeight: '500' }}>Jugadores</Text>
          </View>

          <View
            style={{
              flex: 1,
              padding: 16,
              alignItems: 'center',
              backgroundColor: ClubColors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <Users size={24} color={ClubColors.secondary} />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 8 }}>
              {mockStaff.length}
            </Text>
            <Text style={{ color: ClubColors.muted, fontSize: 14, fontWeight: '500' }}>Staff</Text>
          </View>
        </Animated.View>

        {/* Staff Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={{ paddingHorizontal: 20, marginTop: 8 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Cuerpo Técnico
          </Text>
          {mockStaff.map((staff, index) => (
            <Animated.View
              key={staff.id}
              entering={FadeInUp.duration(400).delay(300 + index * 100)}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  marginBottom: 12,
                  backgroundColor: ClubColors.surface,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: Glass.border,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    borderWidth: 2,
                    borderColor: ClubColors.secondary,
                    overflow: 'hidden',
                    marginRight: 16,
                  }}
                >
                  <Image
                    source={{ uri: staff.avatar }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {staff.name}
                  </Text>
                  <Text style={{ color: ClubColors.secondary, fontSize: 14, marginTop: 2 }}>
                    {staff.role}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={() => handleContact('email', staff.email)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={({ pressed }) => ({
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: pressed ? 'rgba(247, 182, 67, 0.2)' : 'rgba(255,255,255,0.08)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    })}
                  >
                    <Mail size={18} color={ClubColors.muted} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleContact('phone', staff.phone)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={({ pressed }) => ({
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: pressed ? 'rgba(247, 182, 67, 0.2)' : 'rgba(255,255,255,0.08)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    })}
                  >
                    <Phone size={18} color={ClubColors.muted} />
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Players Section */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          style={{ paddingHorizontal: 20, marginTop: 24 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Jugadores
          </Text>
          {mockTeamMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInUp.duration(400).delay(500 + index * 100)}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  marginBottom: 12,
                  backgroundColor: ClubColors.surface,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: Glass.border,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    overflow: 'hidden',
                    marginRight: 16,
                  }}
                >
                  <Image
                    source={{ uri: member.avatar }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {member.name}
                  </Text>
                  <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                    {member.position}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(247, 182, 67, 0.15)',
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: ClubColors.secondary,
                    }}
                  >
                    #{member.number}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
