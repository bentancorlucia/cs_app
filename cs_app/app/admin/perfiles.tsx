import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Search,
  X,
  User,
  Shield,
  Users,
  Clipboard,
  UserCheck,
  Check,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { Profile, UserRole } from '@/src/types/database';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';

const roleConfig: Record<UserRole, { label: string; color: string; description: string }> = {
  admin: {
    label: 'Administrador',
    color: '#ef4444',
    description: 'Acceso total al sistema',
  },
  dt: {
    label: 'Director Técnico',
    color: '#a855f7',
    description: 'Gestiona equipos y asistencias',
  },
  delegado: {
    label: 'Delegado',
    color: '#3b82f6',
    description: 'Asiste al DT y gestiona logística',
  },
  socio_deportivo: {
    label: 'Socio Deportivo',
    color: '#22c55e',
    description: 'Miembro activo con acceso a equipos',
  },
  socio_social: {
    label: 'Socio Social',
    color: '#f7b643',
    description: 'Miembro del club sin participación deportiva',
  },
  no_socio: {
    label: 'No Socio',
    color: '#6b7280',
    description: 'Usuario registrado sin membresía',
  },
};

const allRoles: UserRole[] = ['admin', 'dt', 'delegado', 'socio_deportivo', 'socio_social', 'no_socio'];

export default function PerfilesScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('no_socio');
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      Alert.alert('Error', 'No se pudieron cargar los perfiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    let filtered = profiles;

    if (filterRole !== 'all') {
      filtered = filtered.filter((p) => p.role === filterRole);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
      );
    }

    setFilteredProfiles(filtered);
  }, [searchQuery, profiles, filterRole]);

  const openEditModal = (profile: Profile) => {
    setSelectedProfile(profile);
    setSelectedRole(profile.role);
    setModalVisible(true);
  };

  const handleSaveRole = async () => {
    if (!selectedProfile) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      Alert.alert('Éxito', 'Rol actualizado correctamente');
      setModalVisible(false);
      fetchProfiles();
    } catch (err: any) {
      console.error('Error updating role:', err);
      Alert.alert('Error', err.message || 'No se pudo actualizar el rol');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield size={18} color={roleConfig[role].color} />;
      case 'dt':
        return <Clipboard size={18} color={roleConfig[role].color} />;
      case 'delegado':
        return <Users size={18} color={roleConfig[role].color} />;
      case 'socio_deportivo':
        return <UserCheck size={18} color={roleConfig[role].color} />;
      case 'socio_social':
        return <User size={18} color={roleConfig[role].color} />;
      default:
        return <User size={18} color={roleConfig[role].color} />;
    }
  };

  const getRoleStats = () => {
    const stats: Record<string, number> = {};
    allRoles.forEach((role) => {
      stats[role] = profiles.filter((p) => p.role === role).length;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <View style={{ flex: 1, backgroundColor: ClubColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={true}
      >
        {/* Header */}
        <LinearGradient
          colors={[ClubColors.primary, ClubColors.primaryDark, ClubColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 30 }}
        >
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <View>
              <Text style={{ color: 'white', fontSize: 26, fontWeight: 'bold' }}>
                Tipos de Perfiles
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 }}>
                Gestiona roles y permisos
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={{ paddingHorizontal: 20, marginTop: -10 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius.lg,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <Search size={20} color={ClubColors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre o email..."
              placeholderTextColor={ClubColors.muted}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 12,
                color: 'white',
                fontSize: 16,
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={20} color={ClubColors.muted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Role Filter */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(150)}
          style={{ paddingHorizontal: 20, marginTop: 16 }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => setFilterRole('all')}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: BorderRadius.md,
                  backgroundColor: filterRole === 'all' ? ClubColors.secondary : ClubColors.surface,
                  borderWidth: 1,
                  borderColor: filterRole === 'all' ? ClubColors.secondary : Glass.border,
                }}
              >
                <Text
                  style={{
                    color: filterRole === 'all' ? ClubColors.primary : ClubColors.muted,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  Todos ({profiles.length})
                </Text>
              </Pressable>
              {allRoles.map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setFilterRole(role)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: BorderRadius.md,
                    backgroundColor:
                      filterRole === role ? `${roleConfig[role].color}30` : ClubColors.surface,
                    borderWidth: 1,
                    borderColor: filterRole === role ? roleConfig[role].color : Glass.border,
                  }}
                >
                  <Text
                    style={{
                      color: filterRole === role ? roleConfig[role].color : ClubColors.muted,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    {roleConfig[role].label} ({roleStats[role]})
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Role Legend */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={{ paddingHorizontal: 20, marginTop: 20 }}
        >
          <View
            style={{
              padding: 16,
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius.lg,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              Permisos por Rol
            </Text>
            <View style={{ gap: 8 }}>
              {allRoles.slice(0, 4).map((role) => (
                <View key={role} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: roleConfig[role].color,
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ color: roleConfig[role].color, fontSize: 13, fontWeight: '500', width: 110 }}>
                    {roleConfig[role].label}
                  </Text>
                  <Text style={{ color: ClubColors.muted, fontSize: 12, flex: 1 }}>
                    {roleConfig[role].description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Profiles List */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Usuarios ({filteredProfiles.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={ClubColors.secondary} style={{ marginTop: 40 }} />
          ) : filteredProfiles.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Users size={48} color={ClubColors.muted} />
              <Text style={{ color: ClubColors.muted, fontSize: 16, marginTop: 12 }}>
                No se encontraron usuarios
              </Text>
            </View>
          ) : (
            filteredProfiles.map((profile, index) => (
              <Animated.View
                key={profile.id}
                entering={FadeInUp.duration(300).delay(250 + index * 40)}
              >
                <Pressable
                  onPress={() => openEditModal(profile)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    marginBottom: 10,
                    backgroundColor: pressed ? ClubColors.surfaceElevated : ClubColors.surface,
                    borderRadius: BorderRadius.lg,
                    borderWidth: 1,
                    borderColor: Glass.border,
                  })}
                >
                  {/* Avatar */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: ClubColors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      overflow: 'hidden',
                    }}
                  >
                    {profile.avatar_url ? (
                      <Image
                        source={{ uri: profile.avatar_url }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <User size={24} color={ClubColors.secondary} />
                    )}
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
                      {`${profile.first_name} ${profile.last_name}`.trim()}
                    </Text>
                    <Text
                      style={{ color: ClubColors.muted, fontSize: 12, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {profile.email}
                    </Text>
                  </View>

                  {/* Role Badge */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      backgroundColor: `${roleConfig[profile.role].color}20`,
                      borderRadius: 8,
                    }}
                  >
                    {getRoleIcon(profile.role)}
                    <Text
                      style={{
                        color: roleConfig[profile.role].color,
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}
                    >
                      {roleConfig[profile.role].label}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Role Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius['2xl'],
              padding: 24,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                Cambiar Rol
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: Glass.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color={ClubColors.muted} />
              </Pressable>
            </View>

            {/* User Info */}
            {selectedProfile && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  backgroundColor: ClubColors.background,
                  borderRadius: BorderRadius.lg,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: ClubColors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    overflow: 'hidden',
                  }}
                >
                  {selectedProfile.avatar_url ? (
                    <Image
                      source={{ uri: selectedProfile.avatar_url }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <User size={22} color={ClubColors.secondary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
                    {`${selectedProfile.first_name} ${selectedProfile.last_name}`.trim()}
                  </Text>
                  <Text style={{ color: ClubColors.muted, fontSize: 12, marginTop: 2 }}>
                    {selectedProfile.email}
                  </Text>
                </View>
              </View>
            )}

            {/* Role Selection */}
            <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 12 }}>
              Seleccionar nuevo rol:
            </Text>
            <View style={{ gap: 8 }}>
              {allRoles.map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: BorderRadius.md,
                    backgroundColor:
                      selectedRole === role ? `${roleConfig[role].color}20` : ClubColors.background,
                    borderWidth: 1,
                    borderColor: selectedRole === role ? roleConfig[role].color : Glass.border,
                  }}
                >
                  {getRoleIcon(role)}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        color: selectedRole === role ? roleConfig[role].color : 'white',
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      {roleConfig[role].label}
                    </Text>
                    <Text style={{ color: ClubColors.muted, fontSize: 11, marginTop: 2 }}>
                      {roleConfig[role].description}
                    </Text>
                  </View>
                  {selectedRole === role && (
                    <Check size={20} color={roleConfig[role].color} />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSaveRole}
              disabled={saving}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ClubColors.secondary,
                borderRadius: BorderRadius.lg,
                paddingVertical: 14,
                marginTop: 20,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color={ClubColors.primary} />
              ) : (
                <>
                  <Check size={20} color={ClubColors.primary} />
                  <Text
                    style={{
                      color: ClubColors.primary,
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginLeft: 8,
                    }}
                  >
                    Guardar Cambios
                  </Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
