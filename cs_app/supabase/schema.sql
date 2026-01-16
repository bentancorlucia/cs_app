-- =============================================
-- CLUB SEMINARIO APP - SUPABASE SCHEMA
-- =============================================
-- Run this entire file in the Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =============================================

-- =============================================
-- 1. EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. CUSTOM TYPES (ENUMS)
-- =============================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'socio_social',
  'socio_deportivo',
  'no_socio',
  'dt',
  'delegado',
  'admin'
);

-- Membership types
CREATE TYPE membership_type AS ENUM (
  'socio_social',
  'socio_deportivo'
);

-- Membership status
CREATE TYPE membership_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- Match status
CREATE TYPE match_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

-- Attendance status
CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'excused'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'general',
  'discipline',
  'squad',
  'match',
  'attendance'
);

-- Notification target types
CREATE TYPE notification_target AS ENUM (
  'all',
  'discipline',
  'squad',
  'user'
);

-- =============================================
-- 3. TABLES
-- =============================================

-- -----------------------------------------
-- SOCIOS (Membership Records)
-- Pre-loaded with club member data for verification
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cedula_identidad TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  membership_type membership_type NOT NULL,
  membership_status membership_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------
-- PROFILES (Extends auth.users)
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'no_socio',
  avatar_url TEXT,
  phone TEXT,
  cedula_identidad TEXT UNIQUE,
  socio_id UUID REFERENCES socios(id) ON DELETE SET NULL,
  membership_verified BOOLEAN DEFAULT FALSE,
  membership_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------
-- DISCIPLINES (Sports)
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS disciplines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------
-- SQUADS (Teams within disciplines)
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discipline_id UUID NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  delegate_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discipline_id, name, category)
);

-- -----------------------------------------
-- SQUAD_MEMBERS (Players in squads)
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  jersey_number INTEGER,
  position TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(squad_id, socio_id)
);

-- -----------------------------------------
-- MATCHES
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  match_date DATE NOT NULL,
  match_time TEXT NOT NULL,
  location TEXT NOT NULL,
  is_home BOOLEAN NOT NULL DEFAULT TRUE,
  home_score INTEGER,
  away_score INTEGER,
  status match_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------
-- ATTENDANCE
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, socio_id, date)
);

-- -----------------------------------------
-- NOTIFICATIONS
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type DEFAULT 'general',
  target_type notification_target DEFAULT 'all',
  target_id UUID,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------
-- USER_NOTIFICATIONS (Read status per user)
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cedula ON profiles(cedula_identidad);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_socio ON profiles(socio_id);

-- Socios
CREATE INDEX IF NOT EXISTS idx_socios_cedula ON socios(cedula_identidad);
CREATE INDEX IF NOT EXISTS idx_socios_status ON socios(membership_status);

-- Disciplines
CREATE INDEX IF NOT EXISTS idx_disciplines_active ON disciplines(is_active);

-- Squads
CREATE INDEX IF NOT EXISTS idx_squads_discipline ON squads(discipline_id);
CREATE INDEX IF NOT EXISTS idx_squads_coach ON squads(coach_id);
CREATE INDEX IF NOT EXISTS idx_squads_delegate ON squads(delegate_id);
CREATE INDEX IF NOT EXISTS idx_squads_active ON squads(is_active);

-- Squad Members
CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_socio ON squad_members(socio_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_active ON squad_members(is_active);

-- Matches
CREATE INDEX IF NOT EXISTS idx_matches_squad ON matches(squad_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_squad ON attendance(squad_id);
CREATE INDEX IF NOT EXISTS idx_attendance_socio ON attendance(socio_id);
CREATE INDEX IF NOT EXISTS idx_attendance_match ON attendance(match_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- User Notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can record attendance (DT, Delegado, Admin)
CREATE OR REPLACE FUNCTION can_record_attendance(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role IN ('dt', 'delegado', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can send notifications (DT, Delegado, Admin)
CREATE OR REPLACE FUNCTION can_send_notifications(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role IN ('dt', 'delegado', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access team features
CREATE OR REPLACE FUNCTION can_access_team(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role IN ('socio_deportivo', 'dt', 'delegado', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val FROM profiles WHERE id = user_id;
  RETURN user_role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------
-- PROFILES Policies
-- -----------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view basic info of other profiles (for team rosters)
CREATE POLICY "Users can view other profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert during signup (handled by trigger)
CREATE POLICY "Enable insert for authentication"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- -----------------------------------------
-- SOCIOS Policies
-- -----------------------------------------

-- Only allow reading socios for verification (service role or matching cedula)
CREATE POLICY "Users can verify their own cedula"
  ON socios FOR SELECT
  USING (
    cedula_identidad = (SELECT cedula_identidad FROM profiles WHERE id = auth.uid())
    OR is_admin(auth.uid())
  );

-- Admins can manage socios
CREATE POLICY "Admins can manage socios"
  ON socios FOR ALL
  USING (is_admin(auth.uid()));

-- -----------------------------------------
-- DISCIPLINES Policies
-- -----------------------------------------

-- Everyone can read active disciplines
CREATE POLICY "Anyone can view active disciplines"
  ON disciplines FOR SELECT
  USING (is_active = TRUE OR is_admin(auth.uid()));

-- Admins can manage disciplines
CREATE POLICY "Admins can manage disciplines"
  ON disciplines FOR ALL
  USING (is_admin(auth.uid()));

-- -----------------------------------------
-- SQUADS Policies
-- -----------------------------------------

-- Authenticated users can view active squads
CREATE POLICY "Users can view active squads"
  ON squads FOR SELECT
  USING (is_active = TRUE AND auth.role() = 'authenticated');

-- Admins can manage squads
CREATE POLICY "Admins can manage squads"
  ON squads FOR ALL
  USING (is_admin(auth.uid()));

-- Coaches can update their squads
CREATE POLICY "Coaches can update their squads"
  ON squads FOR UPDATE
  USING (coach_id = auth.uid() OR delegate_id = auth.uid());

-- -----------------------------------------
-- SQUAD_MEMBERS Policies
-- -----------------------------------------

-- Users can view squad members
CREATE POLICY "Users can view squad members"
  ON squad_members FOR SELECT
  USING (auth.role() = 'authenticated');

-- DT/Delegado can manage their squad members
CREATE POLICY "Staff can manage squad members"
  ON squad_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM squads
      WHERE squads.id = squad_members.squad_id
      AND (squads.coach_id = auth.uid() OR squads.delegate_id = auth.uid())
    )
    OR is_admin(auth.uid())
  );

-- -----------------------------------------
-- MATCHES Policies
-- -----------------------------------------

-- Authenticated users can view all matches
CREATE POLICY "Users can view matches"
  ON matches FOR SELECT
  USING (auth.role() = 'authenticated');

-- DT/Delegado can create/update matches for their squads
CREATE POLICY "Staff can manage matches"
  ON matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM squads
      WHERE squads.id = matches.squad_id
      AND (squads.coach_id = auth.uid() OR squads.delegate_id = auth.uid())
    )
    OR is_admin(auth.uid())
  );

-- -----------------------------------------
-- ATTENDANCE Policies
-- -----------------------------------------

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON attendance FOR SELECT
  USING (profile_id = auth.uid());

-- DT/Delegado can view/manage attendance for their squads
CREATE POLICY "Staff can manage attendance"
  ON attendance FOR ALL
  USING (
    can_record_attendance(auth.uid())
    AND EXISTS (
      SELECT 1 FROM squads
      WHERE squads.id = attendance.squad_id
      AND (squads.coach_id = auth.uid() OR squads.delegate_id = auth.uid())
    )
    OR is_admin(auth.uid())
  );

-- -----------------------------------------
-- NOTIFICATIONS Policies
-- -----------------------------------------

-- Users can view notifications targeted to them
CREATE POLICY "Users can view relevant notifications"
  ON notifications FOR SELECT
  USING (
    target_type = 'all'
    OR (target_type = 'user' AND target_id = auth.uid())
    OR (target_type = 'squad' AND EXISTS (
      SELECT 1 FROM squad_members
      JOIN profiles ON profiles.socio_id = squad_members.socio_id
      WHERE squad_members.squad_id = notifications.target_id
      AND profiles.id = auth.uid()
    ))
    OR (target_type = 'discipline' AND EXISTS (
      SELECT 1 FROM squad_members
      JOIN squads ON squads.id = squad_members.squad_id
      JOIN profiles ON profiles.socio_id = squad_members.socio_id
      WHERE squads.discipline_id = notifications.target_id
      AND profiles.id = auth.uid()
    ))
    OR sender_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- DT/Delegado/Admin can create notifications
CREATE POLICY "Staff can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (can_send_notifications(auth.uid()));

-- -----------------------------------------
-- USER_NOTIFICATIONS Policies
-- -----------------------------------------

-- Users can view/update their own notification status
CREATE POLICY "Users can manage their notification status"
  ON user_notifications FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- 7. TRIGGERS
-- =============================================

-- -----------------------------------------
-- Auto-create profile on user signup
-- -----------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Safely get role from metadata, defaulting to 'no_socio'
  BEGIN
    user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'no_socio';
  END;

  IF user_role_val IS NULL THEN
    user_role_val := 'no_socio';
  END IF;

  INSERT INTO profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    user_role_val
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------
-- Auto-update updated_at timestamp
-- -----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to socios
DROP TRIGGER IF EXISTS update_socios_updated_at ON socios;
CREATE TRIGGER update_socios_updated_at
  BEFORE UPDATE ON socios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to matches
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------
-- Create user_notifications when notification is created
-- -----------------------------------------
CREATE OR REPLACE FUNCTION create_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- For 'all' target, create for all users
  IF NEW.target_type = 'all' THEN
    INSERT INTO user_notifications (notification_id, user_id)
    SELECT NEW.id, profiles.id FROM profiles;

  -- For 'user' target, create for specific user
  ELSIF NEW.target_type = 'user' AND NEW.target_id IS NOT NULL THEN
    INSERT INTO user_notifications (notification_id, user_id)
    VALUES (NEW.id, NEW.target_id);

  -- For 'squad' target, create for squad members (only those with linked profiles)
  ELSIF NEW.target_type = 'squad' AND NEW.target_id IS NOT NULL THEN
    INSERT INTO user_notifications (notification_id, user_id)
    SELECT NEW.id, profiles.id
    FROM squad_members
    JOIN profiles ON profiles.socio_id = squad_members.socio_id
    WHERE squad_members.squad_id = NEW.target_id AND squad_members.is_active = TRUE;

  -- For 'discipline' target, create for all members in discipline (only those with linked profiles)
  ELSIF NEW.target_type = 'discipline' AND NEW.target_id IS NOT NULL THEN
    INSERT INTO user_notifications (notification_id, user_id)
    SELECT DISTINCT NEW.id, profiles.id
    FROM squad_members
    JOIN squads ON squads.id = squad_members.squad_id
    JOIN profiles ON profiles.socio_id = squad_members.socio_id
    WHERE squads.discipline_id = NEW.target_id
    AND squad_members.is_active = TRUE
    AND squads.is_active = TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notification_created ON notifications;
CREATE TRIGGER on_notification_created
  AFTER INSERT ON notifications
  FOR EACH ROW EXECUTE FUNCTION create_user_notifications();

-- =============================================
-- 8. VIEWS FOR COMMON QUERIES
-- =============================================

-- View for matches with squad and discipline info
CREATE OR REPLACE VIEW matches_with_details AS
SELECT
  m.*,
  s.name AS squad_name,
  s.category AS squad_category,
  d.name AS discipline_name,
  d.icon_name AS discipline_icon
FROM matches m
JOIN squads s ON s.id = m.squad_id
JOIN disciplines d ON d.id = s.discipline_id;

-- View for squad members with socio info
CREATE OR REPLACE VIEW squad_members_with_socios AS
SELECT
  sm.*,
  soc.first_name,
  soc.last_name,
  soc.cedula_identidad,
  soc.membership_type,
  soc.membership_status,
  s.name AS squad_name,
  s.category AS squad_category,
  d.name AS discipline_name
FROM squad_members sm
JOIN socios soc ON soc.id = sm.socio_id
JOIN squads s ON s.id = sm.squad_id
JOIN disciplines d ON d.id = s.discipline_id;

-- View for user notifications with notification details
CREATE OR REPLACE VIEW user_notifications_detailed AS
SELECT
  un.*,
  n.title,
  n.body,
  n.type,
  n.target_type,
  n.created_at AS notification_created_at,
  p.first_name AS sender_first_name,
  p.last_name AS sender_last_name,
  p.avatar_url AS sender_avatar
FROM user_notifications un
JOIN notifications n ON n.id = un.notification_id
JOIN profiles p ON p.id = n.sender_id;

-- =============================================
-- 9. SEED DATA (Sample Data)
-- =============================================

-- Insert default disciplines
INSERT INTO disciplines (name, description, icon_name, is_active) VALUES
  ('Fútbol', 'Fútbol asociación', 'circle', TRUE),
  ('Básquetbol', 'Baloncesto', 'circle-dot', TRUE),
  ('Rugby', 'Rugby union', 'shield', TRUE),
  ('Handball', 'Balonmano', 'hand', TRUE),
  ('Voleibol', 'Voleibol de sala', 'volleyball', TRUE),
  ('Hockey', 'Hockey sobre césped', 'swords', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert sample socios for testing (remove in production)
INSERT INTO socios (cedula_identidad, first_name, last_name, email, membership_type, membership_status) VALUES
  ('12345678', 'Juan', 'Pérez', 'juan@example.com', 'socio_deportivo', 'active'),
  ('23456789', 'María', 'García', 'maria@example.com', 'socio_social', 'active'),
  ('34567890', 'Carlos', 'López', 'carlos@example.com', 'socio_deportivo', 'active'),
  ('45678901', 'Ana', 'Martínez', 'ana@example.com', 'socio_deportivo', 'inactive')
ON CONFLICT (cedula_identidad) DO NOTHING;

-- =============================================
-- 10. STORAGE BUCKET AND POLICIES
-- =============================================

-- Create the avatars bucket (run this in SQL Editor or via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars (filename must start with their user id)
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (auth.uid())::text = (string_to_array(name, '-'))[1]
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (auth.uid())::text = (string_to_array(name, '-'))[1]
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (auth.uid())::text = (string_to_array(name, '-'))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =============================================
-- 11. GRANTS (for service role access)
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify all tables were created:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =============================================
-- MIGRATION: full_name -> first_name + last_name
-- =============================================
-- Run this ONLY if you have existing data with full_name column
-- This will migrate existing data and then drop the old column

-- Step 1: Add new columns if they don't exist
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
-- ALTER TABLE socios ADD COLUMN IF NOT EXISTS first_name TEXT;
-- ALTER TABLE socios ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Step 2: Migrate existing data (split full_name by first space)
-- UPDATE profiles SET
--   first_name = split_part(full_name, ' ', 1),
--   last_name = NULLIF(substring(full_name from position(' ' in full_name) + 1), '')
-- WHERE full_name IS NOT NULL AND full_name != '' AND first_name IS NULL;

-- UPDATE socios SET
--   first_name = split_part(full_name, ' ', 1),
--   last_name = NULLIF(substring(full_name from position(' ' in full_name) + 1), '')
-- WHERE full_name IS NOT NULL AND full_name != '' AND first_name IS NULL;

-- Step 3: Drop the old column (run after verifying migration)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;
-- ALTER TABLE socios DROP COLUMN IF EXISTS full_name;
