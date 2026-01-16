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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  User,
  Mail,
  CreditCard,
  Check,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { Socio } from '@/src/types/database';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';

type MembershipType = 'socio_social' | 'socio_deportivo';
type MembershipStatus = 'active' | 'inactive' | 'suspended';

export default function SociosScreen() {
  const router = useRouter();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [filteredSocios, setFilteredSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cedula_identidad: '',
    full_name: '',
    email: '',
    membership_type: 'socio_deportivo' as MembershipType,
    membership_status: 'active' as MembershipStatus,
  });

  const fetchSocios = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setSocios(data || []);
      setFilteredSocios(data || []);
    } catch (err) {
      console.error('Error fetching socios:', err);
      Alert.alert('Error', 'No se pudieron cargar los socios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocios();
  }, [fetchSocios]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSocios(socios);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSocios(
        socios.filter(
          (s) =>
            s.full_name.toLowerCase().includes(query) ||
            s.cedula_identidad.includes(query) ||
            (s.email && s.email.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, socios]);

  const openAddModal = () => {
    setEditingSocio(null);
    setFormData({
      cedula_identidad: '',
      full_name: '',
      email: '',
      membership_type: 'socio_deportivo',
      membership_status: 'active',
    });
    setModalVisible(true);
  };

  const openEditModal = (socio: Socio) => {
    setEditingSocio(socio);
    setFormData({
      cedula_identidad: socio.cedula_identidad,
      full_name: socio.full_name,
      email: socio.email || '',
      membership_type: socio.membership_type,
      membership_status: socio.membership_status,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.cedula_identidad.trim() || !formData.full_name.trim()) {
      Alert.alert('Error', 'Cédula y nombre son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingSocio) {
        const { error } = await (supabase as any)
          .from('socios')
          .update({
            cedula_identidad: formData.cedula_identidad.trim(),
            full_name: formData.full_name.trim(),
            email: formData.email.trim() || null,
            membership_type: formData.membership_type,
            membership_status: formData.membership_status,
          })
          .eq('id', editingSocio.id);

        if (error) throw error;
        Alert.alert('Éxito', 'Socio actualizado correctamente');
      } else {
        const { error } = await (supabase as any).from('socios').insert({
          cedula_identidad: formData.cedula_identidad.trim(),
          full_name: formData.full_name.trim(),
          email: formData.email.trim() || null,
          membership_type: formData.membership_type,
          membership_status: formData.membership_status,
        });

        if (error) throw error;
        Alert.alert('Éxito', 'Socio agregado correctamente');
      }

      setModalVisible(false);
      fetchSocios();
    } catch (err: any) {
      console.error('Error saving socio:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar el socio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (socio: Socio) => {
    Alert.alert(
      'Eliminar Socio',
      `¿Estás seguro que deseas eliminar a ${socio.full_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('socios')
                .delete()
                .eq('id', socio.id);

              if (error) throw error;
              Alert.alert('Éxito', 'Socio eliminado correctamente');
              fetchSocios();
            } catch (err: any) {
              console.error('Error deleting socio:', err);
              Alert.alert('Error', err.message || 'No se pudo eliminar el socio');
            }
          },
        },
      ]
    );
  };

  const getMembershipTypeLabel = (type: MembershipType) => {
    return type === 'socio_deportivo' ? 'Deportivo' : 'Social';
  };

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return ClubColors.success;
      case 'inactive':
        return ClubColors.muted;
      case 'suspended':
        return ClubColors.error;
    }
  };

  const getStatusLabel = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'suspended':
        return 'Suspendido';
    }
  };

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
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                Gestionar Socios
              </Text>
            </View>
            <Pressable
              onPress={openAddModal}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: ClubColors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={24} color={ClubColors.primary} />
            </Pressable>
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
              placeholder="Buscar por nombre, cédula o email..."
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

        {/* Stats */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(150)}
          style={{ paddingHorizontal: 20, marginTop: 16 }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <Text style={{ color: ClubColors.muted, fontSize: 13 }}>Total Socios</Text>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
                {socios.length}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <Text style={{ color: ClubColors.muted, fontSize: 13 }}>Activos</Text>
              <Text style={{ color: ClubColors.success, fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
                {socios.filter((s) => s.membership_status === 'active').length}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Socios List */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color={ClubColors.secondary} style={{ marginTop: 40 }} />
          ) : filteredSocios.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: ClubColors.muted, fontSize: 16 }}>
                {searchQuery ? 'No se encontraron resultados' : 'No hay socios registrados'}
              </Text>
            </View>
          ) : (
            filteredSocios.map((socio, index) => (
              <Animated.View
                key={socio.id}
                entering={FadeInUp.duration(300).delay(200 + index * 50)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    marginBottom: 10,
                    backgroundColor: ClubColors.surface,
                    borderRadius: BorderRadius.lg,
                    borderWidth: 1,
                    borderColor: Glass.border,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: ClubColors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <User size={24} color={ClubColors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      {socio.full_name}
                    </Text>
                    <Text style={{ color: ClubColors.muted, fontSize: 13, marginTop: 2 }}>
                      CI: {socio.cedula_identidad}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          backgroundColor: 'rgba(247, 182, 67, 0.15)',
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: ClubColors.secondary, fontSize: 11, fontWeight: '500' }}>
                          {getMembershipTypeLabel(socio.membership_type)}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          backgroundColor: `${getStatusColor(socio.membership_status)}20`,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: getStatusColor(socio.membership_status),
                            fontSize: 11,
                            fontWeight: '500',
                          }}
                        >
                          {getStatusLabel(socio.membership_status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => openEditModal(socio)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Edit3 size={18} color={ClubColors.info} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(socio)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={18} color={ClubColors.error} />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.7)',
              justifyContent: 'flex-end',
            }}
          >
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                backgroundColor: ClubColors.surface,
                borderTopLeftRadius: BorderRadius['2xl'],
                borderTopRightRadius: BorderRadius['2xl'],
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: 40,
                maxHeight: '90%',
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
                    {editingSocio ? 'Editar Socio' : 'Agregar Socio'}
                  </Text>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: Glass.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={20} color={ClubColors.muted} />
                  </Pressable>
                </View>

                {/* Form Fields */}
                <View style={{ gap: 16 }}>
                  {/* Cédula */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Cédula de Identidad *
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: ClubColors.background,
                        borderRadius: BorderRadius.md,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: Glass.border,
                      }}
                    >
                      <CreditCard size={20} color={ClubColors.muted} />
                      <TextInput
                        value={formData.cedula_identidad}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, cedula_identidad: text }))
                        }
                        placeholder="12345678"
                        placeholderTextColor={ClubColors.muted}
                        keyboardType="numeric"
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          paddingHorizontal: 12,
                          color: 'white',
                          fontSize: 16,
                        }}
                      />
                    </View>
                  </View>

                  {/* Full Name */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Nombre Completo *
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: ClubColors.background,
                        borderRadius: BorderRadius.md,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: Glass.border,
                      }}
                    >
                      <User size={20} color={ClubColors.muted} />
                      <TextInput
                        value={formData.full_name}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, full_name: text }))
                        }
                        placeholder="Juan Pérez"
                        placeholderTextColor={ClubColors.muted}
                        autoCapitalize="words"
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          paddingHorizontal: 12,
                          color: 'white',
                          fontSize: 16,
                        }}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Email (opcional)
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: ClubColors.background,
                        borderRadius: BorderRadius.md,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: Glass.border,
                      }}
                    >
                      <Mail size={20} color={ClubColors.muted} />
                      <TextInput
                        value={formData.email}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, email: text }))
                        }
                        placeholder="email@ejemplo.com"
                        placeholderTextColor={ClubColors.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          paddingHorizontal: 12,
                          color: 'white',
                          fontSize: 16,
                        }}
                      />
                    </View>
                  </View>

                  {/* Membership Type */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Tipo de Membresía
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {(['socio_deportivo', 'socio_social'] as MembershipType[]).map((type) => (
                        <Pressable
                          key={type}
                          onPress={() => setFormData((prev) => ({ ...prev, membership_type: type }))}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: BorderRadius.md,
                            backgroundColor:
                              formData.membership_type === type
                                ? ClubColors.secondary
                                : ClubColors.background,
                            borderWidth: 1,
                            borderColor:
                              formData.membership_type === type
                                ? ClubColors.secondary
                                : Glass.border,
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color:
                                formData.membership_type === type
                                  ? ClubColors.primary
                                  : ClubColors.muted,
                              fontWeight: '600',
                              fontSize: 14,
                            }}
                          >
                            {getMembershipTypeLabel(type)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Membership Status */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Estado
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {(['active', 'inactive', 'suspended'] as MembershipStatus[]).map((status) => (
                        <Pressable
                          key={status}
                          onPress={() =>
                            setFormData((prev) => ({ ...prev, membership_status: status }))
                          }
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 8,
                            borderRadius: BorderRadius.md,
                            backgroundColor:
                              formData.membership_status === status
                                ? `${getStatusColor(status)}30`
                                : ClubColors.background,
                            borderWidth: 1,
                            borderColor:
                              formData.membership_status === status
                                ? getStatusColor(status)
                                : Glass.border,
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color:
                                formData.membership_status === status
                                  ? getStatusColor(status)
                                  : ClubColors.muted,
                              fontWeight: '600',
                              fontSize: 13,
                            }}
                          >
                            {getStatusLabel(status)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Save Button */}
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: ClubColors.secondary,
                    borderRadius: BorderRadius.lg,
                    paddingVertical: 16,
                    marginTop: 28,
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
                        {editingSocio ? 'Guardar Cambios' : 'Agregar Socio'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
