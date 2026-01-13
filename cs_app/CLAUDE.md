# Club Seminario App - Project Guidelines

## Visual Identity
- **Primary Color (Maroon):** `#730d32`
- **Secondary Color (Yellow/Gold):** `#f7b643`
- **Aesthetic:** Institutional, modern, clean, mobile-first.
- **UI Language:** Always use **Spanish (Uruguay)** for user-facing text.

## Tech Stack
- **Framework:** React Native (Expo)
- **Navigation:** Expo Router (File-based)
- **Language:** TypeScript
- **Icons:** Lucide React Native
- **Styling:** NativeWind (Tailwind) or StyleSheet (keep it consistent)
- **Backend:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Database Logic:** Relational SQL. Use Joins for fetching Squads and Disciplines.

## User Roles & Architecture
- **Roles:** Socio Social, Socio Deportivo, No-Socio, DT (Coach), Delegado, Admin.
- **RBAC:** Implementation must check user roles before rendering specific features (e.g., Attendance for DT only).

## Coding Standards
- Use functional components with hooks.
- Maintain a clear separation of concerns (Components, Hooks, Constants).
- All filenames for screens should be lowercase (Expo Router requirement).
- All component names should be PascalCase.

## Key Terminology (Spanish)
- Home Section: "A la cancha"
- Notifications: "Centro de Notificaciones"
- Attendance: "Asistencia"
- Results: "Resultados"
- My Team: "Mi Equipo"