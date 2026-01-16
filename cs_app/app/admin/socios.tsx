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
  Users,
  TrendingUp,
  Filter,
  ChevronDown,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { Socio, Discipline } from '@/src/types/database';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';

type MembershipType = 'socio_social' | 'socio_deportivo';
type MembershipStatus = 'active' | 'inactive' | 'suspended';

interface SquadInfo {
  id: string;
  name: string;
  category: string;
  discipline_id: string;
}

interface SocioWithDisciplines extends Socio {
  disciplines?: string[];
  squads?: string[]; // squad ids
}

export default function SociosScreen() {
  const router = useRouter();
  const [socios, setSocios] = useState<SocioWithDisciplines[]>([]);
  const [filteredSocios, setFilteredSocios] = useState<SocioWithDisciplines[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter states
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [squads, setSquads] = useState<SquadInfo[]>([]);
  const [filterType, setFilterType] = useState<MembershipType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<MembershipStatus | 'all'>('all');
  const [filterDiscipline, setFilterDiscipline] = useState<string | 'all'>('all');
  const [filterSquad, setFilterSquad] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [disciplineModalVisible, setDisciplineModalVisible] = useState(false);
  const [squadModalVisible, setSquadModalVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cedula_identidad: '',
    first_name: '',
    last_name: '',
    email: '',
    membership_type: 'socio_deportivo' as MembershipType,
    membership_status: 'active' as MembershipStatus,
  });

  // Helper to get full name from socio
  const getFullName = (socio: Socio | SocioWithDisciplines) =>
    `${socio.first_name} ${socio.last_name}`.trim();

  const fetchSocios = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch socios, disciplines, squads, and squad_members
      const [sociosRes, disciplinesRes, squadsRes, squadMembersRes] = await Promise.all([
        supabase.from('socios').select('*').order('first_name'),
        supabase.from('disciplines').select('*').eq('is_active', true).order('name'),
        supabase.from('squads').select('id, name, category, discipline_id').eq('is_active', true).order('name'),
        supabase.from('squad_members').select('profile_id, squad_id, squad:squads(discipline_id)').eq('is_active', true),
      ]);

      if (sociosRes.error) throw sociosRes.error;
      if (disciplinesRes.error) throw disciplinesRes.error;
      if (squadsRes.error) throw squadsRes.error;

      setDisciplines(disciplinesRes.data || []);
      setSquads((squadsRes.data || []) as SquadInfo[]);

      // Build maps of profile_id -> discipline_ids and squad_ids
      const profileDisciplines: Record<string, Set<string>> = {};
      const profileSquads: Record<string, Set<string>> = {};
      (squadMembersRes.data || []).forEach((sm: any) => {
        if (sm.profile_id && sm.squad?.discipline_id) {
          if (!profileDisciplines[sm.profile_id]) {
            profileDisciplines[sm.profile_id] = new Set();
          }
          profileDisciplines[sm.profile_id].add(sm.squad.discipline_id);
        }
        if (sm.profile_id && sm.squad_id) {
          if (!profileSquads[sm.profile_id]) {
            profileSquads[sm.profile_id] = new Set();
          }
          profileSquads[sm.profile_id].add(sm.squad_id);
        }
      });

      // Enrich socios with their disciplines and squads
      const enrichedSocios: SocioWithDisciplines[] = ((sociosRes.data || []) as Socio[]).map((socio) => ({
        ...socio,
        disciplines: profileDisciplines[socio.id] ? Array.from(profileDisciplines[socio.id]) : [],
        squads: profileSquads[socio.id] ? Array.from(profileSquads[socio.id]) : [],
      }));

      setSocios(enrichedSocios);
      setFilteredSocios(enrichedSocios);
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
    let result = socios;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          getFullName(s).toLowerCase().includes(query) ||
          s.cedula_identidad.includes(query) ||
          (s.email && s.email.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter((s) => s.membership_type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter((s) => s.membership_status === filterStatus);
    }

    // Apply discipline filter (only for deportivo)
    if (filterDiscipline !== 'all' && filterType === 'socio_deportivo') {
      result = result.filter((s) => s.disciplines?.includes(filterDiscipline));
    }

    // Apply squad/category filter
    if (filterSquad !== 'all' && filterType === 'socio_deportivo') {
      result = result.filter((s) => s.squads?.includes(filterSquad));
    }

    setFilteredSocios(result);
  }, [searchQuery, socios, filterType, filterStatus, filterDiscipline, filterSquad]);

  // Reset discipline and squad filters when type changes away from deportivo
  useEffect(() => {
    if (filterType !== 'socio_deportivo') {
      setFilterDiscipline('all');
      setFilterSquad('all');
    }
  }, [filterType]);

  // Reset squad filter when discipline changes
  useEffect(() => {
    setFilterSquad('all');
  }, [filterDiscipline]);

  // Get squads filtered by selected discipline
  const filteredSquads = filterDiscipline === 'all'
    ? squads
    : squads.filter((s) => s.discipline_id === filterDiscipline);

  const openAddModal = () => {
    setEditingSocio(null);
    setFormData({
      cedula_identidad: '',
      first_name: '',
      last_name: '',
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
      first_name: socio.first_name,
      last_name: socio.last_name,
      email: socio.email || '',
      membership_type: socio.membership_type,
      membership_status: socio.membership_status,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.cedula_identidad.trim() || !formData.first_name.trim()) {
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
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
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
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
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
      `¿Estás seguro que deseas eliminar a ${getFullName(socio)}?`,
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

        {/* Filter Toggle */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(120)}
          style={{ paddingHorizontal: 20, marginTop: 12 }}
        >
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: Glass.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Filter size={18} color={ClubColors.secondary} />
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                Filtros
              </Text>
              {(filterType !== 'all' || filterStatus !== 'all' || filterDiscipline !== 'all' || filterSquad !== 'all') && (
                <View
                  style={{
                    backgroundColor: ClubColors.secondary,
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: ClubColors.primary, fontSize: 11, fontWeight: '600' }}>
                    {[filterType !== 'all', filterStatus !== 'all', filterDiscipline !== 'all', filterSquad !== 'all'].filter(Boolean).length}
                  </Text>
                </View>
              )}
            </View>
            <ChevronDown
              size={18}
              color={ClubColors.muted}
              style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }}
            />
          </Pressable>
        </Animated.View>

        {/* Filters */}
        {showFilters && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={{ paddingHorizontal: 20, marginTop: 12 }}
          >
            <View
              style={{
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.lg,
                padding: 16,
                borderWidth: 1,
                borderColor: Glass.border,
                gap: 16,
              }}
            >
              {/* Tipo de Membresia */}
              <View>
                <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
                  Tipo de Membresía
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { value: 'all', label: 'Todos' },
                    { value: 'socio_deportivo', label: 'Deportivo' },
                    { value: 'socio_social', label: 'Social' },
                  ].map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setFilterType(option.value as MembershipType | 'all')}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: BorderRadius.md,
                        backgroundColor:
                          filterType === option.value ? ClubColors.secondary : ClubColors.background,
                        borderWidth: 1,
                        borderColor: filterType === option.value ? ClubColors.secondary : Glass.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: filterType === option.value ? ClubColors.primary : ClubColors.muted,
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Estado */}
              <View>
                <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
                  Estado
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { value: 'all', label: 'Todos', color: ClubColors.muted },
                    { value: 'active', label: 'Activo', color: ClubColors.success },
                    { value: 'inactive', label: 'Inactivo', color: ClubColors.muted },
                    { value: 'suspended', label: 'Suspendido', color: ClubColors.error },
                  ].map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setFilterStatus(option.value as MembershipStatus | 'all')}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: BorderRadius.md,
                        backgroundColor:
                          filterStatus === option.value ? `${option.color}20` : ClubColors.background,
                        borderWidth: 1,
                        borderColor: filterStatus === option.value ? option.color : Glass.border,
                      }}
                    >
                      <Text
                        style={{
                          color: filterStatus === option.value ? option.color : ClubColors.muted,
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Disciplina - solo visible para socios deportivos */}
              {filterType === 'socio_deportivo' && (
                <View>
                  <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
                    Disciplina
                  </Text>
                  <Pressable
                    onPress={() => setDisciplineModalVisible(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      backgroundColor: ClubColors.background,
                      borderRadius: BorderRadius.md,
                      borderWidth: 1,
                      borderColor: Glass.border,
                    }}
                  >
                    <Text
                      style={{
                        color: filterDiscipline !== 'all' ? 'white' : ClubColors.muted,
                        fontSize: 14,
                      }}
                    >
                      {filterDiscipline === 'all'
                        ? 'Todas las disciplinas'
                        : disciplines.find((d) => d.id === filterDiscipline)?.name || 'Seleccionar'}
                    </Text>
                    <ChevronDown size={18} color={ClubColors.muted} />
                  </Pressable>
                </View>
              )}

              {/* Categoria/Equipo - solo visible cuando hay disciplina seleccionada */}
              {filterType === 'socio_deportivo' && filterDiscipline !== 'all' && (
                <View>
                  <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
                    Categoría / Equipo
                  </Text>
                  <Pressable
                    onPress={() => setSquadModalVisible(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      backgroundColor: ClubColors.background,
                      borderRadius: BorderRadius.md,
                      borderWidth: 1,
                      borderColor: Glass.border,
                    }}
                  >
                    <Text
                      style={{
                        color: filterSquad !== 'all' ? 'white' : ClubColors.muted,
                        fontSize: 14,
                      }}
                    >
                      {filterSquad === 'all'
                        ? 'Todas las categorías'
                        : squads.find((s) => s.id === filterSquad)?.name || 'Seleccionar'}
                    </Text>
                    <ChevronDown size={18} color={ClubColors.muted} />
                  </Pressable>
                </View>
              )}

              {/* Clear Filters */}
              {(filterType !== 'all' || filterStatus !== 'all' || filterDiscipline !== 'all' || filterSquad !== 'all') && (
                <Pressable
                  onPress={() => {
                    setFilterType('all');
                    setFilterStatus('all');
                    setFilterDiscipline('all');
                    setFilterSquad('all');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: BorderRadius.md,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  <X size={16} color={ClubColors.error} />
                  <Text style={{ color: ClubColors.error, fontSize: 13, fontWeight: '500', marginLeft: 6 }}>
                    Limpiar filtros
                  </Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {/* Stats */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(150)}
          style={{ paddingHorizontal: 20, marginTop: 16 }}
        >
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderRadius: BorderRadius.xl,
              borderWidth: 1.5,
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={28} color={ClubColors.success} />
                </View>
                <View>
                  <Text style={{ color: ClubColors.muted, fontSize: 13, fontWeight: '500' }}>
                    Socios Activos
                  </Text>
                  <Text style={{ color: ClubColors.success, fontSize: 36, fontWeight: '800', marginTop: 2 }}>
                    {socios.filter((s) => s.membership_status === 'active').length}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    gap: 4,
                  }}
                >
                  <TrendingUp size={14} color={ClubColors.success} />
                  <Text style={{ color: ClubColors.success, fontSize: 12, fontWeight: '600' }}>
                    {socios.length > 0
                      ? Math.round(
                          (socios.filter((s) => s.membership_status === 'active').length / socios.length) * 100
                        )
                      : 0}
                    %
                  </Text>
                </View>
                <Text style={{ color: ClubColors.muted, fontSize: 11, marginTop: 6 }}>
                  de {socios.length} totales
                </Text>
              </View>
            </View>
          </LinearGradient>
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
                      {getFullName(socio)}
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

                  {/* First Name */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Nombre *
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
                        value={formData.first_name}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, first_name: text }))
                        }
                        placeholder="Juan"
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

                  {/* Last Name */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Apellido
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
                        value={formData.last_name}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, last_name: text }))
                        }
                        placeholder="Pérez"
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

      {/* Discipline Filter Modal */}
      <Modal visible={disciplineModalVisible} animationType="fade" transparent>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          onPress={() => setDisciplineModalVisible(false)}
        >
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{
              width: '100%',
              maxWidth: 350,
              maxHeight: '70%',
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius['2xl'],
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Filtrar por Disciplina
              </Text>
              <Pressable onPress={() => setDisciplineModalVisible(false)}>
                <X size={20} color={ClubColors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  setFilterDiscipline('all');
                  setDisciplineModalVisible(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: BorderRadius.md,
                  backgroundColor: filterDiscipline === 'all' ? ClubColors.primary : ClubColors.background,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: filterDiscipline === 'all' ? 'white' : ClubColors.muted,
                    fontSize: 15,
                  }}
                >
                  Todas las disciplinas
                </Text>
              </Pressable>

              {disciplines.map((discipline) => (
                <Pressable
                  key={discipline.id}
                  onPress={() => {
                    setFilterDiscipline(discipline.id);
                    setDisciplineModalVisible(false);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: BorderRadius.md,
                    backgroundColor:
                      filterDiscipline === discipline.id ? ClubColors.primary : ClubColors.background,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: filterDiscipline === discipline.id ? 'white' : ClubColors.muted,
                      fontSize: 15,
                    }}
                  >
                    {discipline.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Squad/Category Filter Modal */}
      <Modal visible={squadModalVisible} animationType="fade" transparent>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          onPress={() => setSquadModalVisible(false)}
        >
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{
              width: '100%',
              maxWidth: 350,
              maxHeight: '70%',
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius['2xl'],
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Filtrar por Categoría
              </Text>
              <Pressable onPress={() => setSquadModalVisible(false)}>
                <X size={20} color={ClubColors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  setFilterSquad('all');
                  setSquadModalVisible(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: BorderRadius.md,
                  backgroundColor: filterSquad === 'all' ? ClubColors.primary : ClubColors.background,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: filterSquad === 'all' ? 'white' : ClubColors.muted,
                    fontSize: 15,
                  }}
                >
                  Todas las categorías
                </Text>
              </Pressable>

              {filteredSquads.map((squad) => (
                <Pressable
                  key={squad.id}
                  onPress={() => {
                    setFilterSquad(squad.id);
                    setSquadModalVisible(false);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: BorderRadius.md,
                    backgroundColor:
                      filterSquad === squad.id ? ClubColors.primary : ClubColors.background,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: filterSquad === squad.id ? 'white' : 'white',
                      fontSize: 15,
                      fontWeight: '500',
                    }}
                  >
                    {squad.name}
                  </Text>
                  <Text
                    style={{
                      color: filterSquad === squad.id ? 'rgba(255,255,255,0.7)' : ClubColors.muted,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {squad.category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
