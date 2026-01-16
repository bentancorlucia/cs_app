import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import {
  Match,
  Discipline,
  Squad,
  SquadMember,
  Notification,
  Profile,
} from '@/src/types/database';

// ============================================
// CATEGORIES HOOK (from squads, filtered by discipline)
// ============================================
export function useCategories(disciplineId?: string) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('squads')
        .select('category')
        .eq('is_active', true);

      // Filter by discipline if one is selected (not 'all')
      if (disciplineId && disciplineId !== 'all') {
        query = query.eq('discipline_id', disciplineId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Extract unique categories and sort them
      const squads = (data || []) as { category: string }[];
      const uniqueCategories = [...new Set(squads.map(s => s.category).filter(Boolean))];

      // Sort categories with custom order for futbol:
      // 1. Femenino (Mayor, Reserva)
      // 2. Masculino (Mayor, Reserva CS, Reserva SU, Sub-X by number)
      // 3. Mami-futbol
      uniqueCategories.sort((a, b) => {
        const getCategoryOrder = (cat: string): number => {
          const lower = cat.toLowerCase();

          // Femenino categories first
          if (lower.includes('femenino') || lower.includes('fem')) {
            if (lower.includes('mayor')) return 1;
            if (lower.includes('reserva')) return 2;
            return 3; // Other femenino
          }

          // Mami-futbol last
          if (lower.includes('mami')) return 1000;

          // Masculino categories
          if (lower.includes('mayor') && !lower.includes('femenino') && !lower.includes('fem')) return 10;
          if (lower.includes('reserva cs')) return 11;
          if (lower.includes('reserva su')) return 12;
          if (lower.includes('reserva') && !lower.includes('femenino') && !lower.includes('fem')) return 13;

          // Sub-X categories (descending order: Sub-20 first, then Sub-18, etc.)
          const subMatch = cat.match(/Sub-?(\d+)/i);
          if (subMatch) {
            const subNumber = parseInt(subMatch[1]);
            // CS before SU for same sub number
            const isCSSub = lower.includes(' cs');
            const baseOrder = 100 + (100 - subNumber); // Sub-20 = 180, Sub-18 = 182, Sub-16 = 184, etc.
            return isCSSub ? baseOrder : baseOrder + 1; // CS gets lower number (comes first)
          }

          return 500; // Other categories
        };

        return getCategoryOrder(a) - getCategoryOrder(b);
      });

      setCategories(uniqueCategories);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

// ============================================
// DISCIPLINES HOOK
// ============================================
export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDisciplines = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('disciplines')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDisciplines(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching disciplines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  return { disciplines, loading, error, refetch: fetchDisciplines };
}

// ============================================
// UPCOMING MATCHES HOOK
// ============================================
export function useUpcomingMatches(limit?: number) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('matches')
        .select(`
          *,
          squad:squads (
            *,
            discipline:disciplines (*)
          )
        `)
        .gte('match_date', today)
        .in('status', ['scheduled', 'in_progress'])
        .order('match_date', { ascending: true })
        .order('match_time', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching upcoming matches:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, error, refetch: fetchMatches };
}

// ============================================
// COMPLETED MATCHES (RESULTS) HOOK
// ============================================
export function useCompletedMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          squad:squads (
            *,
            discipline:disciplines (*)
          )
        `)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching completed matches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, error, refetch: fetchMatches };
}

// ============================================
// USER'S SQUAD HOOK
// ============================================
export function useUserSquad() {
  const { user } = useAuth();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [squadMember, setSquadMember] = useState<SquadMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserSquad = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First get the user's profile to find their socio_id
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('socio_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData?.socio_id) {
        // User doesn't have a linked socio
        setLoading(false);
        return;
      }

      // Get the user's squad membership using socio_id
      const { data: memberData, error: memberError } = await (supabase as any)
        .from('squad_members')
        .select(`
          *,
          squad:squads (
            *,
            discipline:disciplines (*),
            coach:profiles!squads_coach_id_fkey (*),
            delegate:profiles!squads_delegate_id_fkey (*)
          )
        `)
        .eq('socio_id', profileData.socio_id)
        .eq('is_active', true)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (memberData) {
        setSquadMember(memberData as unknown as SquadMember);
        setSquad((memberData as any).squad as Squad);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching user squad:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserSquad();
  }, [fetchUserSquad]);

  return { squad, squadMember, loading, error, refetch: fetchUserSquad };
}

// ============================================
// SQUAD MEMBERS (TEAM ROSTER) HOOK
// ============================================
export function useSquadMembers(squadId?: string) {
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [staff, setStaff] = useState<{ coach?: Profile; delegate?: Profile }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!squadId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch squad members (players)
      const { data: membersData, error: membersError } = await supabase
        .from('squad_members')
        .select(`
          *,
          socio:socios (*)
        `)
        .eq('squad_id', squadId)
        .eq('is_active', true)
        .order('jersey_number');

      if (membersError) throw membersError;

      // Fetch squad info with coach and delegate
      const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .select(`
          coach:profiles!squads_coach_id_fkey (*),
          delegate:profiles!squads_delegate_id_fkey (*)
        `)
        .eq('id', squadId)
        .single();

      if (squadError && squadError.code !== 'PGRST116') {
        throw squadError;
      }

      setMembers((membersData || []) as unknown as SquadMember[]);
      setStaff({
        coach: (squadData as any)?.coach as Profile | undefined,
        delegate: (squadData as any)?.delegate as Profile | undefined,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching squad members:', err);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, staff, loading, error, refetch: fetchMembers };
}

// ============================================
// NOTIFICATIONS HOOK
// ============================================
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First, get notifications targeted to all users or to this specific user
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey (*)
        `)
        .or(`target_type.eq.all,and(target_type.eq.user,target_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      // Update local state optimistically
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      // Check if user_notification record exists
      const { data: existing } = await supabase
        .from('user_notifications')
        .select('id')
        .eq('notification_id', notificationId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await (supabase as any)
          .from('user_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('notification_id', notificationId)
          .eq('user_id', user.id);
      } else {
        await (supabase as any)
          .from('user_notifications')
          .insert({
            notification_id: notificationId,
            user_id: user.id,
            is_read: true,
            read_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert optimistic update on error
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, refetch: fetchNotifications, markAsRead };
}

// ============================================
// USER STATS HOOK
// ============================================
export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    matchesPlayed: 0,
    attendancePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First get the user's socio_id
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('socio_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData?.socio_id) {
        // User doesn't have a linked socio
        setLoading(false);
        return;
      }

      // Get attendance records using socio_id
      const { data: attendanceData, error: attendanceError } = await (supabase as any)
        .from('attendance')
        .select('status')
        .eq('socio_id', profileData.socio_id);

      if (attendanceError) throw attendanceError;

      const records = (attendanceData || []) as { status: string }[];
      const totalRecords = records.length;
      const presentRecords = records.filter(
        a => a.status === 'present' || a.status === 'late'
      ).length;

      setStats({
        matchesPlayed: totalRecords,
        attendancePercentage: totalRecords > 0
          ? Math.round((presentRecords / totalRecords) * 100)
          : 0,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// ============================================
// CLUB INFO HOOK
// ============================================
export function useClubInfo() {
  // Static club info - could be fetched from a settings table in the future
  return {
    name: 'Club Seminario',
    since: 2010,
    location: 'Montevideo',
  };
}
