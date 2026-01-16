import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  X,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { Attendance, Squad, Socio, Discipline } from '@/src/types/database';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: any }> = {
  present: { label: 'Presente', color: '#22c55e', icon: CheckCircle },
  absent: { label: 'Ausente', color: '#ef4444', icon: XCircle },
  late: { label: 'Tardanza', color: '#f59e0b', icon: Clock },
  excused: { label: 'Justificado', color: '#3b82f6', icon: AlertCircle },
};

interface SquadWithDiscipline extends Squad {
  discipline: Discipline;
}

interface MemberWithSocio {
  id: string;
  socio_id: string;
  jersey_number?: number;
  socio: Socio;
}

export default function AsistenciasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [squads, setSquads] = useState<SquadWithDiscipline[]>([]);
  const [members, setMembers] = useState<MemberWithSocio[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});

  const [disciplineModalVisible, setDisciplineModalVisible] = useState(false);
  const [squadModalVisible, setSquadModalVisible] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [disciplinesRes, squadsRes] = await Promise.all([
        supabase.from('disciplines').select('*').eq('is_active', true).order('name'),
        supabase
          .from('squads')
          .select('*, discipline:disciplines(*)')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (disciplinesRes.error) throw disciplinesRes.error;
      if (squadsRes.error) throw squadsRes.error;

      setDisciplines(disciplinesRes.data || []);
      setSquads((squadsRes.data as SquadWithDiscipline[]) || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredSquads = selectedDiscipline
    ? squads.filter((s) => s.discipline_id === selectedDiscipline)
    : squads;

  const fetchSquadMembers = useCallback(async () => {
    if (!selectedSquad) {
      setMembers([]);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('squad_members')
        .select('*, socio:socios(*)')
        .eq('squad_id', selectedSquad)
        .eq('is_active', true)
        .order('jersey_number');

      if (error) throw error;

      setMembers((data as MemberWithSocio[]) || []);

      // Fetch existing attendance for this date and squad
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('squad_id', selectedSquad)
        .eq('date', selectedDate);

      if (attendanceError) throw attendanceError;

      const existingAttendance: Record<string, AttendanceStatus> = {};
      (attendanceData || []).forEach((record: Attendance) => {
        existingAttendance[record.socio_id] = record.status;
      });
      setAttendanceData(existingAttendance);
      setAttendanceRecords(attendanceData || []);
    } catch (err) {
      console.error('Error fetching squad members:', err);
      Alert.alert('Error', 'No se pudieron cargar los miembros');
    } finally {
      setLoading(false);
    }
  }, [selectedSquad, selectedDate]);

  useEffect(() => {
    fetchSquadMembers();
  }, [fetchSquadMembers]);

  const handleStatusChange = (socioId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [socioId]: prev[socioId] === status ? 'absent' : status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSquad || !user?.id) return;

    setSaving(true);
    try {
      // Delete existing attendance records for this squad and date
      await supabase
        .from('attendance')
        .delete()
        .eq('squad_id', selectedSquad)
        .eq('date', selectedDate);

      // Insert new attendance records
      const records = members.map((member) => ({
        squad_id: selectedSquad,
        socio_id: member.socio_id,
        date: selectedDate,
        status: attendanceData[member.socio_id] || 'absent',
        recorded_by: user.id,
      }));

      const { error } = await (supabase as any).from('attendance').insert(records);

      if (error) throw error;

      Alert.alert('Éxito', 'Asistencia guardada correctamente');
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = members.length;
    const present = Object.values(attendanceData).filter((s) => s === 'present').length;
    const late = Object.values(attendanceData).filter((s) => s === 'late').length;
    const excused = Object.values(attendanceData).filter((s) => s === 'excused').length;
    const absent = total - present - late - excused;

    return { total, present, late, excused, absent };
  };

  const stats = getAttendanceStats();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-UY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const selectedDisciplineData = disciplines.find((d) => d.id === selectedDiscipline);
  const selectedSquadData = squads.find((s) => s.id === selectedSquad);

  return (
    <View style={{ flex: 1, backgroundColor: ClubColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={true}
      >
        {/* Header with Enhanced Gradient */}
        <LinearGradient
          colors={[ClubColors.secondary, ClubColors.secondary, '#c9952d', '#9a7323', '#5a4415', ClubColors.background]}
          locations={[0, 0.35, 0.5, 0.65, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 90, paddingBottom: 60 }}
        >
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: 'rgba(115, 13, 50, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <ChevronLeft size={24} color={ClubColors.primary} />
            </Pressable>
            <View>
              <Text style={{ color: ClubColors.primary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                Asistencias
              </Text>
              <Text style={{ color: ClubColors.primary, fontSize: 14, marginTop: 4, opacity: 0.8 }}>
                Control de asistencia
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Filters */}
        <View style={{ paddingHorizontal: 20, marginTop: -10 }}>
          {/* Discipline Selector */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
              Disciplina
            </Text>
            <Pressable
              onPress={() => setDisciplineModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <Text style={{ color: selectedDisciplineData ? 'white' : ClubColors.muted, fontSize: 15 }}>
                {selectedDisciplineData?.name || 'Seleccionar disciplina'}
              </Text>
              <ChevronDown size={20} color={ClubColors.muted} />
            </Pressable>
          </Animated.View>

          {/* Squad Selector */}
          <Animated.View entering={FadeInUp.duration(400).delay(150)} style={{ marginTop: 12 }}>
            <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
              Equipo
            </Text>
            <Pressable
              onPress={() => setSquadModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <Text style={{ color: selectedSquadData ? 'white' : ClubColors.muted, fontSize: 15 }}>
                {selectedSquadData?.name || 'Seleccionar equipo'}
              </Text>
              <ChevronDown size={20} color={ClubColors.muted} />
            </Pressable>
          </Animated.View>

          {/* Date */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={{ marginTop: 12 }}>
            <Text style={{ color: ClubColors.muted, fontSize: 13, marginBottom: 8 }}>
              Fecha
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                backgroundColor: ClubColors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Glass.border,
              }}
            >
              <Calendar size={20} color={ClubColors.secondary} />
              <Text style={{ color: 'white', fontSize: 15, marginLeft: 12, flex: 1 }}>
                {formatDate(selectedDate)}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Stats */}
        {selectedSquad && members.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(250)}
            style={{ paddingHorizontal: 20, marginTop: 20 }}
          >
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Presentes', value: stats.present, color: '#22c55e' },
                { label: 'Tardanzas', value: stats.late, color: '#f59e0b' },
                { label: 'Ausentes', value: stats.absent, color: '#ef4444' },
                { label: 'Justif.', value: stats.excused, color: '#3b82f6' },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor: ClubColors.surface,
                    borderRadius: BorderRadius.md,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: Glass.border,
                  }}
                >
                  <Text style={{ color: stat.color, fontSize: 20, fontWeight: 'bold' }}>
                    {stat.value}
                  </Text>
                  <Text style={{ color: ClubColors.muted, fontSize: 11, marginTop: 2 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Members List */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {!selectedSquad ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Users size={48} color={ClubColors.muted} />
              <Text style={{ color: ClubColors.muted, fontSize: 16, marginTop: 12, textAlign: 'center' }}>
                Selecciona una disciplina y equipo para tomar asistencia
              </Text>
            </View>
          ) : loading ? (
            <ActivityIndicator size="large" color={ClubColors.secondary} style={{ marginTop: 40 }} />
          ) : members.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Users size={48} color={ClubColors.muted} />
              <Text style={{ color: ClubColors.muted, fontSize: 16, marginTop: 12 }}>
                No hay miembros en este equipo
              </Text>
            </View>
          ) : (
            <>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
                Miembros ({members.length})
              </Text>
              {members.map((member, index) => {
                const currentStatus = attendanceData[member.socio_id] || null;

                return (
                  <Animated.View
                    key={member.id}
                    entering={FadeInUp.duration(300).delay(300 + index * 40)}
                  >
                    <View
                      style={{
                        padding: 14,
                        marginBottom: 10,
                        backgroundColor: ClubColors.surface,
                        borderRadius: BorderRadius.lg,
                        borderWidth: 1,
                        borderColor: Glass.border,
                      }}
                    >
                      {/* Member Info */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: ClubColors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          {member.jersey_number ? (
                            <Text style={{ color: ClubColors.secondary, fontSize: 16, fontWeight: 'bold' }}>
                              {member.jersey_number}
                            </Text>
                          ) : (
                            <Users size={20} color={ClubColors.secondary} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
                            {member.socio ? `${member.socio.first_name} ${member.socio.last_name}`.trim() : 'Sin nombre'}
                          </Text>
                        </View>
                        {currentStatus && (
                          <View
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              backgroundColor: `${statusConfig[currentStatus].color}20`,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                color: statusConfig[currentStatus].color,
                                fontSize: 12,
                                fontWeight: '600',
                              }}
                            >
                              {statusConfig[currentStatus].label}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Status Buttons */}
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
                          const config = statusConfig[status];
                          const isSelected = currentStatus === status;
                          const IconComponent = config.icon;

                          return (
                            <Pressable
                              key={status}
                              onPress={() => handleStatusChange(member.socio_id, status)}
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 10,
                                borderRadius: BorderRadius.md,
                                backgroundColor: isSelected ? `${config.color}30` : ClubColors.background,
                                borderWidth: 1,
                                borderColor: isSelected ? config.color : Glass.border,
                              }}
                            >
                              <IconComponent size={16} color={isSelected ? config.color : ClubColors.muted} />
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </Animated.View>
                );
              })}

              {/* Save Button */}
              <Pressable
                onPress={handleSaveAttendance}
                disabled={saving}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: ClubColors.secondary,
                  borderRadius: BorderRadius.lg,
                  paddingVertical: 16,
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
                      Guardar Asistencia
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {/* Discipline Modal */}
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
                Seleccionar Disciplina
              </Text>
              <Pressable onPress={() => setDisciplineModalVisible(false)}>
                <X size={20} color={ClubColors.muted} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setSelectedDiscipline(null);
                setSelectedSquad(null);
                setDisciplineModalVisible(false);
              }}
              style={{
                padding: 14,
                borderRadius: BorderRadius.md,
                backgroundColor: !selectedDiscipline ? ClubColors.primary : ClubColors.background,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: !selectedDiscipline ? 'white' : ClubColors.muted, fontSize: 15 }}>
                Todas las disciplinas
              </Text>
            </Pressable>

            {disciplines.map((discipline) => (
              <Pressable
                key={discipline.id}
                onPress={() => {
                  setSelectedDiscipline(discipline.id);
                  setSelectedSquad(null);
                  setDisciplineModalVisible(false);
                }}
                style={{
                  padding: 14,
                  borderRadius: BorderRadius.md,
                  backgroundColor:
                    selectedDiscipline === discipline.id ? ClubColors.primary : ClubColors.background,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: selectedDiscipline === discipline.id ? 'white' : ClubColors.muted,
                    fontSize: 15,
                  }}
                >
                  {discipline.name}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Squad Modal */}
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
                Seleccionar Equipo
              </Text>
              <Pressable onPress={() => setSquadModalVisible(false)}>
                <X size={20} color={ClubColors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredSquads.length === 0 ? (
                <Text style={{ color: ClubColors.muted, fontSize: 15, textAlign: 'center', padding: 20 }}>
                  No hay equipos disponibles
                </Text>
              ) : (
                filteredSquads.map((squad) => (
                  <Pressable
                    key={squad.id}
                    onPress={() => {
                      setSelectedSquad(squad.id);
                      setSquadModalVisible(false);
                    }}
                    style={{
                      padding: 14,
                      borderRadius: BorderRadius.md,
                      backgroundColor:
                        selectedSquad === squad.id ? ClubColors.primary : ClubColors.background,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedSquad === squad.id ? 'white' : 'white',
                        fontSize: 15,
                        fontWeight: '500',
                      }}
                    >
                      {squad.name}
                    </Text>
                    <Text
                      style={{
                        color: selectedSquad === squad.id ? 'rgba(255,255,255,0.7)' : ClubColors.muted,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {squad.discipline?.name}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
