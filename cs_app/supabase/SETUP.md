# Supabase Setup Guide - Club Seminario App

## Quick Setup Steps

### 1. Run the SQL Scripts

In the Supabase Dashboard, go to **SQL Editor** → **New Query** and run these files in order:

1. **schema.sql** - Creates all tables, indexes, RLS policies, and triggers
2. **functions.sql** - Creates all RPC functions for the app

### 2. Enable Authentication Providers

Go to **Authentication** → **Providers**:

#### Email
- ✅ Enable Email provider
- ✅ Enable "Confirm email" (optional, can disable for easier testing)
- Set Site URL: `csapp://` (for deep linking)

### 3. Configure URL Settings

Go to **Authentication** → **URL Configuration**:

```
Site URL: csapp://
Redirect URLs:
  - csapp://auth/callback
  - csapp://reset-password
  - exp://localhost:8081/--/auth/callback (for Expo development)
```

### 4. Email Templates (Optional)

Go to **Authentication** → **Email Templates** and customize:

- **Confirm signup**: Welcome email with verification link
- **Reset password**: Password reset email
- **Magic Link**: For passwordless login (if enabled)

### 5. Storage Buckets (For Avatars)

Go to **Storage** → **New bucket**:

```
Name: avatars
Public: true
File size limit: 2MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

Add RLS policy:
```sql
-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

## Testing the Setup

### Verify Tables
Run in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- attendance
- disciplines
- matches
- notifications
- profiles
- socios
- squad_members
- squads
- user_notifications

### Test Functions
```sql
-- Test cedula verification
SELECT verify_cedula('12345678');

-- Get disciplines
SELECT * FROM disciplines;

-- Test match query
SELECT * FROM get_upcoming_matches();
```

### Create Test Admin User

After signing up a user, promote them to admin:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## Environment Variables

Make sure your app has these in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://twxxjqitqglidxqckumr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Common Issues

### "permission denied for table"
- Check RLS policies are enabled
- Verify user is authenticated
- Check the user's role has proper access

### "function does not exist"
- Run `functions.sql` in SQL Editor
- Functions are case-sensitive

### Password reset not working
- Verify redirect URLs match exactly
- Check email templates are configured
- Ensure Site URL is set correctly

---

## Sample Data Commands

### Add a new discipline
```sql
INSERT INTO disciplines (name, description, icon_name)
VALUES ('Natación', 'Natación competitiva', 'waves');
```

### Add a squad
```sql
INSERT INTO squads (discipline_id, name, category)
SELECT id, 'Sub-15', 'Juvenil'
FROM disciplines WHERE name = 'Fútbol';
```

### Add a match
```sql
INSERT INTO matches (squad_id, opponent_name, match_date, match_time, location, is_home)
SELECT id, 'Club Nacional', '2026-01-20', '15:00', 'Estadio Seminario', true
FROM squads WHERE name = 'Sub-15' LIMIT 1;
```

### Add socio for testing
```sql
INSERT INTO socios (cedula_identidad, full_name, email, membership_type)
VALUES ('55555555', 'Test User', 'test@example.com', 'socio_deportivo');
```
