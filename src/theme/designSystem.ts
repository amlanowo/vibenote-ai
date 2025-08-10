import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Color Palette inspired by modern UI/UX design
export const colors = {
  // Primary Colors
  primary: '#6366F1', // Modern indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary Colors
  secondary: '#10B981', // Modern green
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Accent Colors
  accent: '#8B5CF6', // Modern purple
  accentLight: '#A78BFA',
  accentDark: '#7C3AED',
  
  // Success/Positive
  success: '#10B981',
  successLight: '#34D399',
  
  // Warning
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  
  // Error/Danger
  error: '#EF4444',
  errorLight: '#F87171',
  
  // Neutral Colors
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',
  
  // Background Colors
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F9FAFB',
  
  // Text Colors
  onBackground: '#111827',
  onSurface: '#111827',
  onSurfaceVariant: '#6B7280',
  
  // Status Colors (for gamification, mood tracking, etc.)
  moodHappy: '#10B981', // Green
  moodGood: '#34D399', // Light green
  moodNeutral: '#F59E0B', // Yellow
  moodSad: '#F97316', // Orange
  moodBad: '#EF4444', // Red
  
  // Streak Colors
  streakActive: '#10B981',
  streakInactive: '#E5E7EB',
  
  // Achievement Colors
  achievementBronze: '#CD7F32',
  achievementSilver: '#C0C0C0',
  achievementGold: '#FFD700',
  achievementDiamond: '#B9F2FF',
};

// Typography System
export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing System
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Component Styles
export const components = {
  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  
  // Button Styles
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    secondary: {
      backgroundColor: colors.gray100,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    outline: {
      borderWidth: 1,
      borderColor: colors.gray300,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
  },
  
  // Input Styles
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  
  // Chip Styles
  chip: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
};

// Theme Configuration
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    surface: colors.surface,
    background: colors.background,
    onSurface: colors.onSurface,
    onBackground: colors.onBackground,
  },
  roundness: borderRadius.md,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    surface: colors.gray800,
    background: colors.gray900,
    onSurface: colors.gray100,
    onBackground: colors.gray100,
  },
  roundness: borderRadius.md,
};

// Utility Functions
export const getMoodColor = (moodScore: number) => {
  if (moodScore >= 8) return colors.moodHappy;
  if (moodScore >= 6) return colors.moodGood;
  if (moodScore >= 4) return colors.moodNeutral;
  if (moodScore >= 2) return colors.moodSad;
  return colors.moodBad;
};

export const getStreakColor = (isActive: boolean) => {
  return isActive ? colors.streakActive : colors.streakInactive;
};

export const getAchievementColor = (level: 'bronze' | 'silver' | 'gold' | 'diamond') => {
  switch (level) {
    case 'bronze': return colors.achievementBronze;
    case 'silver': return colors.achievementSilver;
    case 'gold': return colors.achievementGold;
    case 'diamond': return colors.achievementDiamond;
    default: return colors.achievementBronze;
  }
};

