-- =============================================
-- CLUB SEMINARIO APP - RPC FUNCTIONS
-- =============================================
-- Additional functions for app-specific operations
-- Run after schema.sql
-- =============================================

-- =============================================
-- 1. MEMBERSHIP VERIFICATION FUNCTIONS
-- =============================================

-- Function to verify cedula against socios table
CREATE OR REPLACE FUNCTION verify_cedula(p_cedula TEXT)
RETURNS JSON AS $$
DECLARE
  socio_record RECORD;
  result JSON;
BEGIN
  -- Look for matching cedula in socios table
  SELECT * INTO socio_record
  FROM socios
  WHERE cedula_identidad = p_cedula
  AND membership_status = 'active';

  IF FOUND THEN
    result := json_build_object(
      'success', TRUE,
      'socio_id', socio_record.id,
      'full_name', socio_record.full_name,
      'membership_type', socio_record.membership_type,
      'membership_status', socio_record.membership_status
    );
  ELSE
    result := json_build_object(
      'success', FALSE,
      'message', 'Cédula no encontrada o membresía inactiva'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link profile to socio after verification
CREATE OR REPLACE FUNCTION link_profile_to_socio(
  p_profile_id UUID,
  p_cedula TEXT
)
RETURNS JSON AS $$
DECLARE
  socio_record RECORD;
  new_role user_role;
  result JSON;
BEGIN
  -- Find the socio
  SELECT * INTO socio_record
  FROM socios
  WHERE cedula_identidad = p_cedula
  AND membership_status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Cédula no encontrada o membresía inactiva'
    );
  END IF;

  -- Determine role based on membership type
  IF socio_record.membership_type = 'socio_deportivo' THEN
    new_role := 'socio_deportivo';
  ELSE
    new_role := 'socio_social';
  END IF;

  -- Update the profile
  UPDATE profiles
  SET
    cedula_identidad = p_cedula,
    socio_id = socio_record.id,
    role = new_role,
    membership_verified = TRUE,
    membership_verified_at = NOW(),
    updated_at = NOW()
  WHERE id = p_profile_id;

  result := json_build_object(
    'success', TRUE,
    'role', new_role,
    'socio_id', socio_record.id
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. MATCH QUERIES
-- =============================================

-- Get upcoming matches with filters
CREATE OR REPLACE FUNCTION get_upcoming_matches(
  p_discipline_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  squad_id UUID,
  opponent_name TEXT,
  match_date DATE,
  match_time TEXT,
  location TEXT,
  is_home BOOLEAN,
  status match_status,
  squad_name TEXT,
  squad_category TEXT,
  discipline_name TEXT,
  discipline_icon TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.squad_id,
    m.opponent_name,
    m.match_date,
    m.match_time,
    m.location,
    m.is_home,
    m.status,
    s.name AS squad_name,
    s.category AS squad_category,
    d.name AS discipline_name,
    d.icon_name AS discipline_icon
  FROM matches m
  JOIN squads s ON s.id = m.squad_id
  JOIN disciplines d ON d.id = s.discipline_id
  WHERE m.status IN ('scheduled', 'in_progress')
  AND m.match_date >= CURRENT_DATE
  AND (p_discipline_id IS NULL OR d.id = p_discipline_id)
  AND (p_category IS NULL OR s.category = p_category)
  ORDER BY m.match_date ASC, m.match_time ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get match results with filters
CREATE OR REPLACE FUNCTION get_match_results(
  p_discipline_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  squad_id UUID,
  opponent_name TEXT,
  match_date DATE,
  match_time TEXT,
  location TEXT,
  is_home BOOLEAN,
  home_score INTEGER,
  away_score INTEGER,
  status match_status,
  squad_name TEXT,
  squad_category TEXT,
  discipline_name TEXT,
  discipline_icon TEXT,
  result TEXT -- 'W', 'L', 'D'
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.squad_id,
    m.opponent_name,
    m.match_date,
    m.match_time,
    m.location,
    m.is_home,
    m.home_score,
    m.away_score,
    m.status,
    s.name AS squad_name,
    s.category AS squad_category,
    d.name AS discipline_name,
    d.icon_name AS discipline_icon,
    CASE
      WHEN m.home_score IS NULL OR m.away_score IS NULL THEN NULL
      WHEN m.home_score > m.away_score THEN 'W'
      WHEN m.home_score < m.away_score THEN 'L'
      ELSE 'D'
    END AS result
  FROM matches m
  JOIN squads s ON s.id = m.squad_id
  JOIN disciplines d ON d.id = s.discipline_id
  WHERE m.status = 'completed'
  AND (p_discipline_id IS NULL OR d.id = p_discipline_id)
  AND (p_category IS NULL OR s.category = p_category)
  ORDER BY m.match_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get match statistics for a squad
CREATE OR REPLACE FUNCTION get_squad_stats(p_squad_id UUID)
RETURNS TABLE (
  total_matches BIGINT,
  wins BIGINT,
  draws BIGINT,
  losses BIGINT,
  goals_for BIGINT,
  goals_against BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_matches,
    COUNT(*) FILTER (WHERE home_score > away_score) AS wins,
    COUNT(*) FILTER (WHERE home_score = away_score) AS draws,
    COUNT(*) FILTER (WHERE home_score < away_score) AS losses,
    COALESCE(SUM(home_score), 0) AS goals_for,
    COALESCE(SUM(away_score), 0) AS goals_against
  FROM matches
  WHERE squad_id = p_squad_id
  AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. TEAM/SQUAD QUERIES
-- =============================================

-- Get user's squads (teams they belong to)
CREATE OR REPLACE FUNCTION get_user_squads(p_user_id UUID)
RETURNS TABLE (
  squad_id UUID,
  squad_name TEXT,
  category TEXT,
  discipline_name TEXT,
  discipline_icon TEXT,
  jersey_number INTEGER,
  "position" TEXT,
  is_coach BOOLEAN,
  is_delegate BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS squad_id,
    s.name AS squad_name,
    s.category,
    d.name AS discipline_name,
    d.icon_name AS discipline_icon,
    sm.jersey_number,
    sm.position,
    (s.coach_id = p_user_id) AS is_coach,
    (s.delegate_id = p_user_id) AS is_delegate
  FROM squad_members sm
  JOIN squads s ON s.id = sm.squad_id
  JOIN disciplines d ON d.id = s.discipline_id
  WHERE sm.profile_id = p_user_id
  AND sm.is_active = TRUE
  AND s.is_active = TRUE

  UNION

  -- Also include squads where user is coach/delegate but not a member
  SELECT
    s.id AS squad_id,
    s.name AS squad_name,
    s.category,
    d.name AS discipline_name,
    d.icon_name AS discipline_icon,
    NULL::INTEGER AS jersey_number,
    NULL::TEXT AS position,
    (s.coach_id = p_user_id) AS is_coach,
    (s.delegate_id = p_user_id) AS is_delegate
  FROM squads s
  JOIN disciplines d ON d.id = s.discipline_id
  WHERE (s.coach_id = p_user_id OR s.delegate_id = p_user_id)
  AND s.is_active = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM squad_members sm2
    WHERE sm2.squad_id = s.id AND sm2.profile_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get squad roster (all members)
CREATE OR REPLACE FUNCTION get_squad_roster(p_squad_id UUID)
RETURNS TABLE (
  member_id UUID,
  profile_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  jersey_number INTEGER,
  "position" TEXT,
  role user_role,
  member_type TEXT -- 'player', 'coach', 'delegate'
) AS $$
BEGIN
  RETURN QUERY
  -- Players
  SELECT
    sm.id AS member_id,
    p.id AS profile_id,
    p.full_name,
    p.avatar_url,
    sm.jersey_number,
    sm.position,
    p.role,
    'player'::TEXT AS member_type
  FROM squad_members sm
  JOIN profiles p ON p.id = sm.profile_id
  WHERE sm.squad_id = p_squad_id
  AND sm.is_active = TRUE

  UNION ALL

  -- Coach (if not already a member)
  SELECT
    NULL::UUID AS member_id,
    p.id AS profile_id,
    p.full_name,
    p.avatar_url,
    NULL::INTEGER AS jersey_number,
    'Director Técnico'::TEXT AS position,
    p.role,
    'coach'::TEXT AS member_type
  FROM squads s
  JOIN profiles p ON p.id = s.coach_id
  WHERE s.id = p_squad_id
  AND s.coach_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM squad_members sm
    WHERE sm.squad_id = p_squad_id AND sm.profile_id = s.coach_id
  )

  UNION ALL

  -- Delegate (if not already a member)
  SELECT
    NULL::UUID AS member_id,
    p.id AS profile_id,
    p.full_name,
    p.avatar_url,
    NULL::INTEGER AS jersey_number,
    'Delegado'::TEXT AS position,
    p.role,
    'delegate'::TEXT AS member_type
  FROM squads s
  JOIN profiles p ON p.id = s.delegate_id
  WHERE s.id = p_squad_id
  AND s.delegate_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM squad_members sm
    WHERE sm.squad_id = p_squad_id AND sm.profile_id = s.delegate_id
  )

  ORDER BY member_type DESC, jersey_number ASC NULLS LAST, full_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. NOTIFICATION QUERIES
-- =============================================

-- Get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_unread_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  notification_id UUID,
  title TEXT,
  body TEXT,
  type notification_type,
  is_read BOOLEAN,
  sender_name TEXT,
  sender_avatar TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    un.notification_id,
    n.title,
    n.body,
    n.type,
    un.is_read,
    p.full_name AS sender_name,
    p.avatar_url AS sender_avatar,
    n.created_at
  FROM user_notifications un
  JOIN notifications n ON n.id = un.notification_id
  JOIN profiles p ON p.id = n.sender_id
  WHERE un.user_id = p_user_id
  AND (NOT p_unread_only OR un.is_read = FALSE)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_user_id UUID,
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND notification_id = p_notification_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE user_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM user_notifications
    WHERE user_id = p_user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ATTENDANCE FUNCTIONS
-- =============================================

-- Record attendance for a squad member
CREATE OR REPLACE FUNCTION record_attendance(
  p_squad_id UUID,
  p_profile_id UUID,
  p_date DATE,
  p_status attendance_status,
  p_recorded_by UUID,
  p_match_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify the recorder has permission
  IF NOT can_record_attendance(p_recorded_by) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'No tienes permiso para registrar asistencia'
    );
  END IF;

  -- Insert or update attendance
  INSERT INTO attendance (match_id, squad_id, profile_id, date, status, notes, recorded_by)
  VALUES (p_match_id, p_squad_id, p_profile_id, p_date, p_status, p_notes, p_recorded_by)
  ON CONFLICT (squad_id, profile_id, date)
  DO UPDATE SET
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    recorded_by = EXCLUDED.recorded_by,
    match_id = EXCLUDED.match_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Asistencia registrada correctamente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get attendance summary for a player
CREATE OR REPLACE FUNCTION get_player_attendance_summary(
  p_profile_id UUID,
  p_squad_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_sessions BIGINT,
  present_count BIGINT,
  absent_count BIGINT,
  late_count BIGINT,
  excused_count BIGINT,
  attendance_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'present') AS present_count,
    COUNT(*) FILTER (WHERE status = 'absent') AS absent_count,
    COUNT(*) FILTER (WHERE status = 'late') AS late_count,
    COUNT(*) FILTER (WHERE status = 'excused') AS excused_count,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('present', 'late'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      1
    ) AS attendance_rate
  FROM attendance
  WHERE profile_id = p_profile_id
  AND (p_squad_id IS NULL OR squad_id = p_squad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ADMIN FUNCTIONS
-- =============================================

-- Update user role (admin only)
CREATE OR REPLACE FUNCTION update_user_role(
  p_admin_id UUID,
  p_target_user_id UUID,
  p_new_role user_role
)
RETURNS JSON AS $$
BEGIN
  -- Verify admin permission
  IF NOT is_admin(p_admin_id) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'No tienes permiso de administrador'
    );
  END IF;

  -- Update role
  UPDATE profiles
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Usuario no encontrado'
    );
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Rol actualizado correctamente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign coach to squad
CREATE OR REPLACE FUNCTION assign_coach(
  p_admin_id UUID,
  p_squad_id UUID,
  p_coach_id UUID
)
RETURNS JSON AS $$
BEGIN
  -- Verify admin permission
  IF NOT is_admin(p_admin_id) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'No tienes permiso de administrador'
    );
  END IF;

  -- Update coach role
  UPDATE profiles
  SET role = 'dt', updated_at = NOW()
  WHERE id = p_coach_id AND role NOT IN ('admin');

  -- Assign to squad
  UPDATE squads
  SET coach_id = p_coach_id
  WHERE id = p_squad_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'DT asignado correctamente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign delegate to squad
CREATE OR REPLACE FUNCTION assign_delegate(
  p_admin_id UUID,
  p_squad_id UUID,
  p_delegate_id UUID
)
RETURNS JSON AS $$
BEGIN
  -- Verify admin permission
  IF NOT is_admin(p_admin_id) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'No tienes permiso de administrador'
    );
  END IF;

  -- Update delegate role
  UPDATE profiles
  SET role = 'delegado', updated_at = NOW()
  WHERE id = p_delegate_id AND role NOT IN ('admin', 'dt');

  -- Assign to squad
  UPDATE squads
  SET delegate_id = p_delegate_id
  WHERE id = p_squad_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Delegado asignado correctamente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. UTILITY FUNCTIONS
-- =============================================

-- Get all categories for a discipline
CREATE OR REPLACE FUNCTION get_discipline_categories(p_discipline_id UUID)
RETURNS TABLE (category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT s.category
  FROM squads s
  WHERE s.discipline_id = p_discipline_id
  AND s.is_active = TRUE
  ORDER BY s.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search users by name or email
CREATE OR REPLACE FUNCTION search_users(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role user_role
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.role
  FROM profiles p
  WHERE
    p.full_name ILIKE '%' || p_search_term || '%'
    OR p.email ILIKE '%' || p_search_term || '%'
  ORDER BY p.full_name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
