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
  Plus,
  Edit3,
  Trash2,
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Trophy,
  Home,
  Plane,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { Match, Squad } from '@/src/types/database';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';

type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export default function PartidosScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const [formData, setFormData] = useState({
    squad_id: '',
    opponent_name: '',
    match_date: '',
    match_time: '',
    location: '',
    is_home: true,
    home_score: '',
    away_score: '',
    status: 'scheduled' as MatchStatus,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [matchesRes, squadsRes] = await Promise.all([
        supabase
          .from('matches')
          .select(`
            *,
            squad:squads (
              *,
              discipline:disciplines (*)
            )
          `)
          .order('match_date', { ascending: false })
          .limit(50),
        supabase
          .from('squads')
          .select(`*, discipline:disciplines (*)`)
          .eq('is_active', true)
          .order('name'),
      ]);

      if (matchesRes.error) throw matchesRes.error;
      if (squadsRes.error) throw squadsRes.error;

      setMatches(matchesRes.data || []);
      setSquads(squadsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'upcoming') {
      return m.status === 'scheduled' || m.status === 'in_progress';
    }
    return m.status === 'completed' || m.status === 'cancelled';
  });

  const openAddModal = () => {
    setEditingMatch(null);
    setFormData({
      squad_id: squads[0]?.id || '',
      opponent_name: '',
      match_date: new Date().toISOString().split('T')[0],
      match_time: '15:00',
      location: '',
      is_home: true,
      home_score: '',
      away_score: '',
      status: 'scheduled',
    });
    setModalVisible(true);
  };

  const openEditModal = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      squad_id: match.squad_id,
      opponent_name: match.opponent_name,
      match_date: match.match_date,
      match_time: match.match_time,
      location: match.location,
      is_home: match.is_home,
      home_score: match.home_score?.toString() || '',
      away_score: match.away_score?.toString() || '',
      status: match.status,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.squad_id || !formData.opponent_name.trim() || !formData.match_date) {
      Alert.alert('Error', 'Equipo, rival y fecha son requeridos');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        squad_id: formData.squad_id,
        opponent_name: formData.opponent_name.trim(),
        match_date: formData.match_date,
        match_time: formData.match_time || '15:00',
        location: formData.location.trim() || 'Por definir',
        is_home: formData.is_home,
        home_score: formData.home_score ? parseInt(formData.home_score) : null,
        away_score: formData.away_score ? parseInt(formData.away_score) : null,
        status: formData.status,
      };

      if (editingMatch) {
        const { error } = await (supabase as any)
          .from('matches')
          .update(payload)
          .eq('id', editingMatch.id);

        if (error) throw error;
        Alert.alert('Éxito', 'Partido actualizado correctamente');
      } else {
        const { error } = await (supabase as any).from('matches').insert(payload);

        if (error) throw error;
        Alert.alert('Éxito', 'Partido agregado correctamente');
      }

      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving match:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar el partido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (match: Match) => {
    Alert.alert(
      'Eliminar Partido',
      `¿Estás seguro que deseas eliminar el partido vs ${match.opponent_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('matches').delete().eq('id', match.id);
              if (error) throw error;
              Alert.alert('Éxito', 'Partido eliminado correctamente');
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar el partido');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return ClubColors.info;
      case 'in_progress':
        return ClubColors.warning;
      case 'completed':
        return ClubColors.success;
      case 'cancelled':
        return ClubColors.error;
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'in_progress':
        return 'En Juego';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-UY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getResultDisplay = (match: Match) => {
    if (match.home_score === null || match.away_score === null) return null;
    return `${match.home_score} - ${match.away_score}`;
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
                Partidos y Resultados
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

        {/* Tabs */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={{ paddingHorizontal: 20, marginTop: -10 }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: ClubColors.surface,
              borderRadius: BorderRadius.lg,
              padding: 4,
            }}
          >
            {(['upcoming', 'completed'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: BorderRadius.md,
                  backgroundColor: activeTab === tab ? ClubColors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? 'white' : ClubColors.muted,
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {tab === 'upcoming' ? 'Próximos' : 'Finalizados'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Matches List */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color={ClubColors.secondary} style={{ marginTop: 40 }} />
          ) : filteredMatches.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Trophy size={48} color={ClubColors.muted} />
              <Text style={{ color: ClubColors.muted, fontSize: 16, marginTop: 12 }}>
                No hay partidos {activeTab === 'upcoming' ? 'programados' : 'finalizados'}
              </Text>
            </View>
          ) : (
            filteredMatches.map((match, index) => (
              <Animated.View
                key={match.id}
                entering={FadeInUp.duration(300).delay(150 + index * 50)}
              >
                <View
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    backgroundColor: ClubColors.surface,
                    borderRadius: BorderRadius.lg,
                    borderWidth: 1,
                    borderColor: Glass.border,
                  }}
                >
                  {/* Squad & Status */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: ClubColors.secondary, fontSize: 13, fontWeight: '600' }}>
                      {(match.squad as any)?.name || 'Equipo'} •{' '}
                      {(match.squad as any)?.discipline?.name || ''}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        backgroundColor: `${getStatusColor(match.status)}20`,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: getStatusColor(match.status),
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {getStatusLabel(match.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Teams & Score */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {match.is_home ? (
                          <Home size={14} color={ClubColors.success} style={{ marginRight: 6 }} />
                        ) : (
                          <Plane size={14} color={ClubColors.info} style={{ marginRight: 6 }} />
                        )}
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                          Club Seminario
                        </Text>
                      </View>
                      <Text style={{ color: ClubColors.muted, fontSize: 14, marginTop: 4 }}>
                        vs {match.opponent_name}
                      </Text>
                    </View>

                    {getResultDisplay(match) && (
                      <View
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          backgroundColor: ClubColors.primary,
                          borderRadius: BorderRadius.md,
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                          {getResultDisplay(match)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Calendar size={14} color={ClubColors.muted} />
                      <Text style={{ color: ClubColors.muted, fontSize: 13, marginLeft: 6 }}>
                        {formatDate(match.match_date)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={14} color={ClubColors.muted} />
                      <Text style={{ color: ClubColors.muted, fontSize: 13, marginLeft: 6 }}>
                        {match.match_time}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <MapPin size={14} color={ClubColors.muted} />
                    <Text
                      style={{ color: ClubColors.muted, fontSize: 13, marginLeft: 6 }}
                      numberOfLines={1}
                    >
                      {match.location}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: Glass.border,
                      gap: 8,
                    }}
                  >
                    <Pressable
                      onPress={() => openEditModal(match)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: BorderRadius.md,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      }}
                    >
                      <Edit3 size={16} color={ClubColors.info} />
                      <Text style={{ color: ClubColors.info, fontSize: 13, marginLeft: 6 }}>
                        Editar
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(match)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: BorderRadius.md,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <Trash2 size={16} color={ClubColors.error} />
                      <Text style={{ color: ClubColors.error, fontSize: 13, marginLeft: 6 }}>
                        Eliminar
                      </Text>
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
                    {editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
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

                {/* Form */}
                <View style={{ gap: 16 }}>
                  {/* Squad Selection */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Equipo *
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {squads.map((squad) => (
                          <Pressable
                            key={squad.id}
                            onPress={() => setFormData((prev) => ({ ...prev, squad_id: squad.id }))}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              borderRadius: BorderRadius.md,
                              backgroundColor:
                                formData.squad_id === squad.id
                                  ? ClubColors.secondary
                                  : ClubColors.background,
                              borderWidth: 1,
                              borderColor:
                                formData.squad_id === squad.id
                                  ? ClubColors.secondary
                                  : Glass.border,
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  formData.squad_id === squad.id
                                    ? ClubColors.primary
                                    : ClubColors.muted,
                                fontWeight: '500',
                                fontSize: 13,
                              }}
                            >
                              {squad.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Opponent */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Rival *
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
                      <Users size={20} color={ClubColors.muted} />
                      <TextInput
                        value={formData.opponent_name}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, opponent_name: text }))
                        }
                        placeholder="Nombre del equipo rival"
                        placeholderTextColor={ClubColors.muted}
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

                  {/* Date & Time */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                        Fecha *
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
                        <Calendar size={20} color={ClubColors.muted} />
                        <TextInput
                          value={formData.match_date}
                          onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, match_date: text }))
                          }
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={ClubColors.muted}
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
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                        Hora
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
                        <Clock size={20} color={ClubColors.muted} />
                        <TextInput
                          value={formData.match_time}
                          onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, match_time: text }))
                          }
                          placeholder="HH:MM"
                          placeholderTextColor={ClubColors.muted}
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
                  </View>

                  {/* Location */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Ubicación
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
                      <MapPin size={20} color={ClubColors.muted} />
                      <TextInput
                        value={formData.location}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, location: text }))
                        }
                        placeholder="Cancha / Estadio"
                        placeholderTextColor={ClubColors.muted}
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

                  {/* Home/Away */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Condición
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable
                        onPress={() => setFormData((prev) => ({ ...prev, is_home: true }))}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 12,
                          borderRadius: BorderRadius.md,
                          backgroundColor: formData.is_home
                            ? ClubColors.success + '30'
                            : ClubColors.background,
                          borderWidth: 1,
                          borderColor: formData.is_home ? ClubColors.success : Glass.border,
                        }}
                      >
                        <Home size={18} color={formData.is_home ? ClubColors.success : ClubColors.muted} />
                        <Text
                          style={{
                            color: formData.is_home ? ClubColors.success : ClubColors.muted,
                            marginLeft: 8,
                            fontWeight: '600',
                          }}
                        >
                          Local
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setFormData((prev) => ({ ...prev, is_home: false }))}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 12,
                          borderRadius: BorderRadius.md,
                          backgroundColor: !formData.is_home
                            ? ClubColors.info + '30'
                            : ClubColors.background,
                          borderWidth: 1,
                          borderColor: !formData.is_home ? ClubColors.info : Glass.border,
                        }}
                      >
                        <Plane size={18} color={!formData.is_home ? ClubColors.info : ClubColors.muted} />
                        <Text
                          style={{
                            color: !formData.is_home ? ClubColors.info : ClubColors.muted,
                            marginLeft: 8,
                            fontWeight: '600',
                          }}
                        >
                          Visitante
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Status */}
                  <View>
                    <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                      Estado
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {(['scheduled', 'in_progress', 'completed', 'cancelled'] as MatchStatus[]).map(
                          (status) => (
                            <Pressable
                              key={status}
                              onPress={() => setFormData((prev) => ({ ...prev, status }))}
                              style={{
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: BorderRadius.md,
                                backgroundColor:
                                  formData.status === status
                                    ? `${getStatusColor(status)}30`
                                    : ClubColors.background,
                                borderWidth: 1,
                                borderColor:
                                  formData.status === status
                                    ? getStatusColor(status)
                                    : Glass.border,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    formData.status === status
                                      ? getStatusColor(status)
                                      : ClubColors.muted,
                                  fontWeight: '500',
                                  fontSize: 13,
                                }}
                              >
                                {getStatusLabel(status)}
                              </Text>
                            </Pressable>
                          )
                        )}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Score (only if completed) */}
                  {(formData.status === 'completed' || formData.status === 'in_progress') && (
                    <View>
                      <Text style={{ color: ClubColors.muted, fontSize: 14, marginBottom: 8 }}>
                        Resultado
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={{ color: ClubColors.muted, fontSize: 12, marginBottom: 6 }}>
                            Club Seminario
                          </Text>
                          <TextInput
                            value={formData.home_score}
                            onChangeText={(text) =>
                              setFormData((prev) => ({ ...prev, home_score: text }))
                            }
                            placeholder="0"
                            placeholderTextColor={ClubColors.muted}
                            keyboardType="numeric"
                            style={{
                              width: 60,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              backgroundColor: ClubColors.background,
                              borderRadius: BorderRadius.md,
                              borderWidth: 1,
                              borderColor: Glass.border,
                              color: 'white',
                              fontSize: 20,
                              fontWeight: 'bold',
                              textAlign: 'center',
                            }}
                          />
                        </View>
                        <Text style={{ color: ClubColors.muted, fontSize: 18, fontWeight: 'bold' }}>
                          -
                        </Text>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={{ color: ClubColors.muted, fontSize: 12, marginBottom: 6 }}>
                            {formData.opponent_name || 'Rival'}
                          </Text>
                          <TextInput
                            value={formData.away_score}
                            onChangeText={(text) =>
                              setFormData((prev) => ({ ...prev, away_score: text }))
                            }
                            placeholder="0"
                            placeholderTextColor={ClubColors.muted}
                            keyboardType="numeric"
                            style={{
                              width: 60,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              backgroundColor: ClubColors.background,
                              borderRadius: BorderRadius.md,
                              borderWidth: 1,
                              borderColor: Glass.border,
                              color: 'white',
                              fontSize: 20,
                              fontWeight: 'bold',
                              textAlign: 'center',
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  )}
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
                        {editingMatch ? 'Guardar Cambios' : 'Crear Partido'}
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
