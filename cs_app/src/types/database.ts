export type UserRole =
  | 'socio_social'
  | 'socio_deportivo'
  | 'no_socio'
  | 'dt'
  | 'delegado'
  | 'admin';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Discipline {
  id: string;
  name: string;           // e.g., "Futbol", "Basquet", "Handball"
  description?: string;
  icon_name?: string;     // Lucide icon name
  is_active: boolean;
  created_at: string;
}

export interface Squad {
  id: string;
  discipline_id: string;
  name: string;           // e.g., "Sub-15", "Primera", "Femenino"
  category: string;       // e.g., "Juvenil", "Mayor", "Infantil"
  coach_id?: string;      // FK to profiles (DT)
  delegate_id?: string;   // FK to profiles (Delegado)
  is_active: boolean;
  created_at: string;
  // Relations (for TypeScript convenience)
  discipline?: Discipline;
  coach?: Profile;
  delegate?: Profile;
}

export interface SquadMember {
  id: string;
  squad_id: string;
  socio_id: string;
  jersey_number?: number;
  position?: string;
  joined_at: string;
  is_active: boolean;
  // Relations
  squad?: Squad;
  socio?: Socio;
}

export interface Match {
  id: string;
  squad_id: string;
  opponent_name: string;
  match_date: string;     // ISO date string
  match_time: string;     // HH:MM format
  location: string;
  is_home: boolean;
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  // Relations
  squad?: Squad;
}

export interface Attendance {
  id: string;
  match_id?: string;      // Optional: for match attendance
  squad_id: string;
  socio_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recorded_by: string;    // FK to profiles (DT/Delegado who recorded)
  created_at: string;
  // Relations
  socio?: Socio;
  match?: Match;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'discipline' | 'squad' | 'match' | 'attendance';
  target_type: 'all' | 'discipline' | 'squad' | 'user';
  target_id?: string;     // discipline_id, squad_id, or profile_id
  sender_id: string;      // FK to profiles
  is_read: boolean;
  created_at: string;
  // Relations
  sender?: Profile;
}

export interface UserNotification {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Socio {
  id: string;
  cedula_identidad: string;
  first_name: string;
  last_name: string;
  email?: string;
  membership_type: 'socio_social' | 'socio_deportivo';
  membership_status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

// Supabase Database type for client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      disciplines: {
        Row: Discipline;
        Insert: Omit<Discipline, 'id' | 'created_at'>;
        Update: Partial<Omit<Discipline, 'id' | 'created_at'>>;
      };
      squads: {
        Row: Squad;
        Insert: Omit<Squad, 'id' | 'created_at'>;
        Update: Partial<Omit<Squad, 'id' | 'created_at'>>;
      };
      squad_members: {
        Row: SquadMember;
        Insert: Omit<SquadMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<SquadMember, 'id' | 'joined_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at'>>;
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Attendance, 'id' | 'created_at'>;
        Update: Partial<Omit<Attendance, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      user_notifications: {
        Row: UserNotification;
        Insert: Omit<UserNotification, 'id' | 'created_at'>;
        Update: Partial<Omit<UserNotification, 'id' | 'created_at'>>;
      };
      socios: {
        Row: Socio;
        Insert: Omit<Socio, 'id' | 'created_at'>;
        Update: Partial<Omit<Socio, 'id' | 'created_at'>>;
      };
    };
  };
}
