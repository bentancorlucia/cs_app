-- Migration: Cambiar squad_members y attendance para usar socio_id en lugar de profile_id
-- Esto permite asignar socios a planteles sin necesidad de que estén registrados en la app

-- =============================================
-- 1. MODIFICAR TABLA squad_members
-- =============================================

-- Agregar columna socio_id
ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS socio_id UUID REFERENCES socios(id) ON DELETE CASCADE;

-- Migrar datos existentes: obtener socio_id desde profiles
UPDATE squad_members sm
SET socio_id = p.socio_id
FROM profiles p
WHERE sm.profile_id = p.id AND p.socio_id IS NOT NULL;

-- Eliminar registros que no tienen socio asociado (opcional, descomentar si quieres limpiar)
-- DELETE FROM squad_members WHERE socio_id IS NULL;

-- Hacer socio_id NOT NULL (solo si todos los registros tienen socio_id)
ALTER TABLE squad_members ALTER COLUMN socio_id SET NOT NULL;

-- Eliminar constraint antiguo
ALTER TABLE squad_members DROP CONSTRAINT IF EXISTS squad_members_squad_id_profile_id_key;

-- Agregar nuevo constraint único
ALTER TABLE squad_members ADD CONSTRAINT squad_members_squad_id_socio_id_key UNIQUE (squad_id, socio_id);

-- Eliminar columna profile_id (hacerlo después de verificar que la migración fue exitosa)
-- ALTER TABLE squad_members DROP COLUMN profile_id;

-- Actualizar índice
DROP INDEX IF EXISTS idx_squad_members_profile;
CREATE INDEX IF NOT EXISTS idx_squad_members_socio ON squad_members(socio_id);

-- =============================================
-- 2. MODIFICAR TABLA attendance
-- =============================================

-- Agregar columna socio_id
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS socio_id UUID REFERENCES socios(id) ON DELETE CASCADE;

-- Migrar datos existentes
UPDATE attendance a
SET socio_id = p.socio_id
FROM profiles p
WHERE a.profile_id = p.id AND p.socio_id IS NOT NULL;

-- Eliminar constraint antiguo
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_squad_id_profile_id_date_key;

-- Agregar nuevo constraint único
ALTER TABLE attendance ADD CONSTRAINT attendance_squad_id_socio_id_date_key UNIQUE (squad_id, socio_id, date);

-- Eliminar columna profile_id (hacerlo después de verificar)
-- ALTER TABLE attendance DROP COLUMN profile_id;

-- Actualizar índice
DROP INDEX IF EXISTS idx_attendance_profile;
CREATE INDEX IF NOT EXISTS idx_attendance_socio ON attendance(socio_id);

-- Actualizar política RLS de attendance (usa profile_id, hay que cambiarla a socio_id)
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;

CREATE POLICY "Users can view own attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.socio_id = attendance.socio_id
    )
  );

-- =============================================
-- 3. ACTUALIZAR POLÍTICAS RLS
-- =============================================

-- Eliminar política antigua de notificaciones
DROP POLICY IF EXISTS "Users can view relevant notifications" ON notifications;

-- Crear nueva política que usa socio_id
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

-- =============================================
-- 4. ACTUALIZAR FUNCIÓN DE TRIGGER PARA NOTIFICACIONES
-- =============================================

CREATE OR REPLACE FUNCTION create_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- For 'all' target, create notification for all users
  IF NEW.target_type = 'all' THEN
    INSERT INTO user_notifications (notification_id, user_id)
    SELECT NEW.id, id FROM profiles;

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

-- =============================================
-- 5. ACTUALIZAR VISTA squad_members_with_socios
-- =============================================

DROP VIEW IF EXISTS squad_members_with_profiles;

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

-- =============================================
-- 6. PASO FINAL: ELIMINAR COLUMNAS profile_id
-- =============================================
-- IMPORTANTE: Ejecutar estos comandos SOLO después de verificar que todo funciona correctamente

-- Verificar que no hay registros sin socio_id:
-- SELECT COUNT(*) FROM squad_members WHERE socio_id IS NULL;
-- SELECT COUNT(*) FROM attendance WHERE socio_id IS NULL;

-- Si todo está bien, ejecutar estos comandos:

-- Primero recrear la vista sin la columna profile_id
DROP VIEW IF EXISTS squad_members_with_socios;

CREATE OR REPLACE VIEW squad_members_with_socios AS
SELECT
  sm.id,
  sm.squad_id,
  sm.socio_id,
  sm.jersey_number,
  sm.position,
  sm.joined_at,
  sm.is_active,
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

-- Ahora eliminar las columnas profile_id
ALTER TABLE squad_members DROP COLUMN profile_id;
ALTER TABLE squad_members ALTER COLUMN socio_id SET NOT NULL;
ALTER TABLE attendance DROP COLUMN profile_id;
ALTER TABLE attendance ALTER COLUMN socio_id SET NOT NULL;
