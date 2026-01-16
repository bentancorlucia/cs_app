import React from 'react';
import { View, Text, ScrollView, Image, Pressable, Linking, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Mail, Phone, User } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ClubColors, Glass } from '@/constants/theme';
import { useUserSquad, useSquadMembers } from '@/src/hooks/useData';

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
  // Get user's squad
  const { squad, loading: loadingSquad } = useUserSquad();

  // Get squad members using the squad ID
  const { members, staff, loading: loadingMembers } = useSquadMembers(squad?.id);

  const isLoading = loadingSquad || loadingMembers;

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
              {squad ? `${squad.discipline?.name} - ${squad.name}` : 'Sin equipo asignado'}
            </Text>
          </Animated.View>
        </LinearGradient>

        {isLoading ? (
          <View style={{ padding: 64, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={ClubColors.secondary} />
          </View>
        ) : !squad ? (
          <Animated.View
            entering={FadeInUp.duration(500).delay(100)}
            style={{ paddingHorizontal: 20, paddingVertical: 64, alignItems: 'center' }}
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
              <Users size={36} color={ClubColors.muted} />
            </View>
            <Text style={{ color: ClubColors.muted, textAlign: 'center', fontSize: 16 }}>
              No estás asignado a ningún equipo.{'\n'}Contacta al club para más información.
            </Text>
          </Animated.View>
        ) : (
          <>
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
                  {members.length}
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
                  {(staff.coach ? 1 : 0) + (staff.delegate ? 1 : 0)}
                </Text>
                <Text style={{ color: ClubColors.muted, fontSize: 14, fontWeight: '500' }}>Staff</Text>
              </View>
            </Animated.View>

            {/* Staff Section */}
            {(staff.coach || staff.delegate) && (
              <Animated.View
                entering={FadeInUp.duration(500).delay(200)}
                style={{ paddingHorizontal: 20, marginTop: 8 }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  Cuerpo Técnico
                </Text>

                {staff.coach && (
                  <Animated.View entering={FadeInUp.duration(400).delay(300)}>
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
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {staff.coach.avatar_url ? (
                          <Image
                            source={{ uri: staff.coach.avatar_url }}
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <User size={24} color={ClubColors.muted} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                          {`${staff.coach.first_name} ${staff.coach.last_name}`.trim()}
                        </Text>
                        <Text style={{ color: ClubColors.secondary, fontSize: 14, marginTop: 2 }}>
                          Director Técnico
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        {staff.coach.email && (
                          <Pressable
                            onPress={() => handleContact('email', staff.coach!.email)}
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
                        )}
                        {staff.coach.phone && (
                          <Pressable
                            onPress={() => handleContact('phone', staff.coach!.phone!)}
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
                        )}
                      </View>
                    </View>
                  </Animated.View>
                )}

                {staff.delegate && (
                  <Animated.View entering={FadeInUp.duration(400).delay(400)}>
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
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {staff.delegate.avatar_url ? (
                          <Image
                            source={{ uri: staff.delegate.avatar_url }}
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <User size={24} color={ClubColors.muted} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                          {`${staff.delegate.first_name} ${staff.delegate.last_name}`.trim()}
                        </Text>
                        <Text style={{ color: ClubColors.secondary, fontSize: 14, marginTop: 2 }}>
                          Delegado/a
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        {staff.delegate.email && (
                          <Pressable
                            onPress={() => handleContact('email', staff.delegate!.email)}
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
                        )}
                        {staff.delegate.phone && (
                          <Pressable
                            onPress={() => handleContact('phone', staff.delegate!.phone!)}
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
                        )}
                      </View>
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            )}

            {/* Players Section */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(400)}
              style={{ paddingHorizontal: 20, marginTop: 24 }}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                Jugadores
              </Text>
              {members.length === 0 ? (
                <View
                  style={{
                    padding: 32,
                    backgroundColor: ClubColors.surface,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: Glass.border,
                    alignItems: 'center',
                  }}
                >
                  <Users size={32} color={ClubColors.muted} />
                  <Text style={{ color: ClubColors.muted, marginTop: 12, textAlign: 'center' }}>
                    No hay jugadores registrados
                  </Text>
                </View>
              ) : (
                members.map((member, index) => (
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
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <User size={24} color={ClubColors.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                          {member.socio ? `${member.socio.first_name} ${member.socio.last_name}`.trim() : 'Jugador'}
                        </Text>
                        <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 2 }}>
                          {member.position || 'Sin posición'}
                        </Text>
                      </View>
                      {member.jersey_number && (
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
                            #{member.jersey_number}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
