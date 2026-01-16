import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Users,
  Trophy,
  UserCog,
  ClipboardCheck,
  ChevronRight,
  Shield,
  TrendingUp,
  Calendar,
  UserPlus,
  RefreshCw,
  Zap,
  Activity,
  Star,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ClubColors, Glass, BorderRadius } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';

interface AdminMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: '/admin/socios' | '/admin/partidos' | '/admin/perfiles' | '/admin/asistencias';
  gradient: [string, string];
  iconBg: string;
}

interface DashboardStats {
  totalSocios: number;
  sociosActivos: number;
  totalPartidos: number;
  partidosProximos: number;
  totalUsuarios: number;
  asistenciaHoy: number;
}

const menuItems: readonly AdminMenuItem[] = [
  {
    id: 'socios',
    title: 'Gestionar Socios',
    description: 'Agregar, editar o eliminar socios',
    icon: <Users size={24} color="white" />,
    route: '/admin/socios',
    gradient: ['#F7B643', '#d4992e'],
    iconBg: 'rgba(247, 182, 67, 0.2)',
  },
  {
    id: 'partidos',
    title: 'Partidos y Resultados',
    description: 'Programar y registrar resultados',
    icon: <Trophy size={24} color="white" />,
    route: '/admin/partidos',
    gradient: ['#22c55e', '#16a34a'],
    iconBg: 'rgba(34, 197, 94, 0.2)',
  },
  {
    id: 'perfiles',
    title: 'Tipos de Perfiles',
    description: 'Gestionar roles y permisos',
    icon: <UserCog size={24} color="white" />,
    route: '/admin/perfiles',
    gradient: ['#3b82f6', '#2563eb'],
    iconBg: 'rgba(59, 130, 246, 0.2)',
  },
  {
    id: 'asistencias',
    title: 'Asistencias',
    description: 'Control de todas las disciplinas',
    icon: <ClipboardCheck size={24} color="white" />,
    route: '/admin/asistencias',
    gradient: ['#a855f7', '#9333ea'],
    iconBg: 'rgba(168, 85, 247, 0.2)',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  loading,
  onPress,
  delay = 0,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: any;
  color: string;
  loading: boolean;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      style={[{ flex: 1 }, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          padding: 16,
          backgroundColor: ClubColors.surface,
          borderRadius: BorderRadius.xl,
          borderWidth: 1,
          borderColor: Glass.border,
          minHeight: 140,
        }}
      >

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: `${color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} color={color} />
          </View>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: `${color}15`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={14} color={color} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={color} style={{ marginTop: 16 }} />
        ) : (
          <>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: '800', marginTop: 14, letterSpacing: -1 }}>
              {value}
            </Text>
            <Text style={{ color: ClubColors.muted, fontSize: 13, fontWeight: '500', marginTop: 2 }}>
              {title}
            </Text>
            {subtitle && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 6 }} />
                <Text style={{ color, fontSize: 12, fontWeight: '600' }}>
                  {subtitle}
                </Text>
              </View>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

function MenuCard({
  item,
  index,
  onPress
}: {
  item: AdminMenuItem;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(400).delay(200 + index * 80)}
      style={animatedStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          marginBottom: 12,
          borderRadius: BorderRadius.xl,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[ClubColors.surface, ClubColors.surfaceElevated]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: Glass.border,
          }}
        >
          {/* Icon with gradient background */}
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            {item.icon}
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>
              {item.title}
            </Text>
            <Text style={{ color: ClubColors.muted, fontSize: 13, marginTop: 3 }}>
              {item.description}
            </Text>
          </View>

          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: `${item.gradient[0]}15`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={20} color={item.gradient[0]} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  color,
  onPress,
  delay = 0,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay)}
      style={[{ flex: 1 }, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: `${color}15`,
          borderRadius: BorderRadius.lg,
          borderWidth: 1.5,
          borderColor: color,
          gap: 8,
        }}
      >
        <Icon size={18} color={color} />
        <Text style={{ color, fontSize: 14, fontWeight: '700' }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function AdminMenuScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSocios: 0,
    sociosActivos: 0,
    totalPartidos: 0,
    partidosProximos: 0,
    totalUsuarios: 0,
    asistenciaHoy: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [sociosRes, partidosRes, perfilesRes, asistenciaRes] = await Promise.all([
        supabase.from('socios').select('id, membership_status', { count: 'exact' }),
        supabase.from('matches').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('attendance').select('id', { count: 'exact' }).eq('date', today),
      ]);

      const socios = sociosRes.data || [];
      const partidos = partidosRes.data || [];

      setStats({
        totalSocios: sociosRes.count || 0,
        sociosActivos: socios.filter((s: any) => s.membership_status === 'active').length,
        totalPartidos: partidosRes.count || 0,
        partidosProximos: partidos.filter((p: any) => p.status === 'scheduled').length,
        totalUsuarios: perfilesRes.count || 0,
        asistenciaHoy: asistenciaRes.count || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  return (
    <View style={{ flex: 1, backgroundColor: ClubColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ClubColors.secondary}
          />
        }
      >
        {/* Header with Enhanced Gradient */}
        <LinearGradient
          colors={[ClubColors.secondary, ClubColors.secondary, '#c9952d', '#9a7323', '#5a4415', ClubColors.background]}
          locations={[0, 0.35, 0.5, 0.65, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 60 }}
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
            <View style={{ flex: 1 }}>
              <Text style={{ color: ClubColors.primary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                Panel Admin
              </Text>
              <Text style={{ color: ClubColors.primary, fontSize: 14, marginTop: 4, opacity: 0.8 }}>
                Club Seminario - Gestión Central
              </Text>
            </View>
          </Animated.View>

          {/* Live indicator */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#064e3b',
                }}
              />
              <Text style={{ color: '#064e3b', fontSize: 12, fontWeight: '600' }}>
                Sistema Activo
              </Text>
            </View>
            <View style={{ width: 1, height: 12, backgroundColor: 'rgba(115, 13, 50, 0.3)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Activity size={14} color={ClubColors.primary} />
              <Text style={{ color: ClubColors.primary, fontSize: 12, opacity: 0.8 }}>
                Tiempo real
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginTop: -30 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              title="Socios activos"
              value={stats.sociosActivos}
              icon={Users}
              color={ClubColors.secondary}
              loading={loading}
              onPress={() => router.push('/admin/socios')}
              delay={50}
            />
            <StatCard
              title="Usuarios app"
              value={stats.totalUsuarios}
              icon={UserCog}
              color="#3b82f6"
              loading={loading}
              onPress={() => router.push('/admin/perfiles')}
              delay={100}
            />
          </View>
        </View>

        {/* Section Title with icon */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(250)}
          style={{
            paddingHorizontal: 20,
            marginTop: 32,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: 'rgba(247, 182, 67, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} color={ClubColors.secondary} />
          </View>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
            Herramientas
          </Text>
        </Animated.View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20 }}>
          {menuItems.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => router.push(item.route)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(500)}
          style={{
            paddingHorizontal: 20,
            marginTop: 28,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={18} color="#22c55e" />
          </View>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
            Acciones Rápidas
          </Text>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 12 }}>
          <QuickActionButton
            icon={UserPlus}
            label="Nuevo Socio"
            color={ClubColors.secondary}
            onPress={() => router.push('/admin/socios')}
            delay={550}
          />
          <QuickActionButton
            icon={Calendar}
            label="Nuevo Partido"
            color="#22c55e"
            onPress={() => router.push('/admin/partidos')}
            delay={600}
          />
        </View>

        {/* Info Card with premium feel */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(650)}
          style={{ paddingHorizontal: 20, marginTop: 28 }}
        >
          <LinearGradient
            colors={['rgba(115, 13, 50, 0.4)', 'rgba(90, 10, 39, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderRadius: BorderRadius.xl,
              borderWidth: 1,
              borderColor: 'rgba(247, 182, 67, 0.2)',
            }}
          >
            {/* Decorative corner */}
            <View
              style={{
                position: 'absolute',
                top: -1,
                right: 20,
                width: 60,
                height: 3,
                backgroundColor: ClubColors.secondary,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(247, 182, 67, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Shield size={18} color={ClubColors.secondary} />
              </View>
              <View>
                <Text style={{ color: ClubColors.secondary, fontSize: 14, fontWeight: '700' }}>
                  Panel de Administración
                </Text>
                <Text style={{ color: ClubColors.muted, fontSize: 12 }}>
                  Acceso completo habilitado
                </Text>
              </View>
            </View>

            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 }}>
              Gestiona socios, partidos, perfiles y asistencias. Los cambios se reflejan en tiempo real para todos los usuarios.
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#22c55e',
                    marginRight: 8,
                  }}
                />
                <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: '600' }}>
                  Sincronizado
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RefreshCw size={14} color="#3b82f6" style={{ marginRight: 6 }} />
                <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600' }}>
                  Pull to refresh
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
