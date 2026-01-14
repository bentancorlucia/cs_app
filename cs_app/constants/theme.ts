/**
 * Club Seminario Brand Colors and Theme Configuration
 */

import { Platform } from 'react-native';

// Club Seminario Brand Colors - Following Design System
export const ClubColors = {
  primary: '#730D32',      // Maroon - headers, primary cards, branding
  secondary: '#F7B643',    // Gold - highlights, active states

  // Backgrounds (Design System)
  background: '#000000',   // Pure black main background
  surface: '#1A1A1A',      // Dark grey for content cards
  surfaceElevated: '#252525', // Slightly lighter for elevated surfaces

  // Primary variations
  primaryLight: '#8b1a42',
  primaryDark: '#5a0a27',
  secondaryLight: '#f9c76a',
  secondaryDark: '#d4992e',

  // Base colors
  white: '#ffffff',
  black: '#000000',

  // Muted text color (Design System)
  muted: '#9CA3AF',

  // Grayscale
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },

  // Semantic colors
  success: '#22c55e',
  warning: '#ffc107',
  error: '#ef4444',
  info: '#3b82f6',
};

// Glass/Transparency values (Design System)
export const Glass = {
  card: 'rgba(26, 26, 26, 0.7)',      // 70% opacity dark cards
  cardLight: 'rgba(26, 26, 26, 0.5)', // 50% opacity
  border: 'rgba(255, 255, 255, 0.1)', // 10% white border
  borderLight: 'rgba(255, 255, 255, 0.05)',
  hover: 'rgba(255, 255, 255, 0.05)', // Hover state
  overlay: 'rgba(0, 0, 0, 0.2)',      // Dark overlay for depth
  blur: 16,                           // Standard blur value
};

export const Colors = {
  light: {
    text: '#212529',
    background: '#f8f9fa',
    tint: ClubColors.primary,
    icon: '#6c757d',
    tabIconDefault: '#6c757d',
    tabIconSelected: ClubColors.primary,
    card: '#ffffff',
    border: '#dee2e6',
  },
  dark: {
    text: '#f8f9fa',
    background: '#212529',
    tint: ClubColors.secondary,
    icon: '#adb5bd',
    tabIconDefault: '#adb5bd',
    tabIconSelected: ClubColors.secondary,
    card: '#343a40',
    border: '#495057',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing constants
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius - Modern smooth values
export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
};
