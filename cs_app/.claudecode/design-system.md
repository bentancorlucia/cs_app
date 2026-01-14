# Design System: Club Management App

## 1. Core Visual Identity
- **Primary Color (Maroon):** `#730D32` (Used for headers, primary cards, and branding elements).
- **Secondary Color (Gold):** `#F7B643` (Used for highlights, "vs" text, and active navigation states).
- **Base Background:** `#000000` (Pure Black for the main application body).
- **Surface/Card Background:** `#1A1A1A` (Slightly lighter dark grey for content cards).
- **Aesthetic Direction:** Institutional, premium, and clean. Mobile-first approach inspired by high-end sports interfaces.

## 2. Typography & Language
- **Language:** **Spanish (Uruguay)** for all user-facing strings (e.g., "Próximos Partidos", "Cancha Principal", "Bienvenido").
- **Font Family:** Clean Sans-serif (Inter or system-native fonts).
- **Hierarchy:**
    - **Welcome Header:** Large, bold, white text.
    - **Section Titles:** Medium bold with "Ver todos" action links in Gold.
    - **Metadata:** Small, muted grey (`#9CA3AF`) for secondary info like "mayores", "socio deportivo", or timestamps.

## 3. Component Geometry
- **Border Radius:**
    - **Main Containers/Cards:** `24px` for a modern, rounded look.
    - **Action Buttons & Tags:** `12px` or fully rounded (`pill`).
- **Spacing:** Strict 4px grid system (e.g., `gap-4`, `p-4`, `m-2`).
- **Visual Elevation:** No heavy shadows. Use subtle borders or slight color variations from the background to define hierarchy.

## 4. Smooth Transitions & Motion
All interactive elements must feel fluid and high-quality.
- **Global Transition:** `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Interaction Feedback:**
    - **Buttons/Cards:** Subtle scale down on press (`scale-95` or `0.98`).
    - **Hover:** Slight brightness increase or gold border-glow.
- **Framer Motion Presets:**
'''javascript
const smoothTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};'''

## 5. Transparencies & Glassmorphism
To achieve the premium look from the reference, follow these transparency rules:

### Surface Transparency (Glassmorphism)
- **Glass Cards:** Use a background color with 60% to 80% opacity.
  - Example: `rgba(26, 26, 26, 0.7)` for dark cards.
- **Backdrop Blur:** Always apply a blur effect to transparent surfaces to maintain readability.
  - Standard blur: `12px` to `20px` (`backdrop-filter: blur(16px)`).
- **Subtle Borders:** Transparent cards must have a 1px solid border with low opacity (`white` at 10% opacity) to define the edge against dark backgrounds.

### Maroon Overlays
- **Primary Header Overlay:** For elements over the Maroon background (#730D32), use a 20% black tint (`rgba(0,0,0,0.2)`) to create depth in containers like the "Club Seminario" card.

### Interaction States
- **Overlays:** Use `rgba(255, 255, 255, 0.05)` for hover states on dark surfaces.
- **Inactive Elements:** Set opacity to `0.5` or `0.6` for secondary information that isn't the primary focus.

### Example Implementation (Tailwind)
```html
<div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4">
  </div>