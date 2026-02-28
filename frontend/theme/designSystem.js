const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 22,
};

export const lightTheme = {
  mode: 'light',
  colors: {
    bg: '#F6F8FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EFF4FA',
    border: '#D9E2EC',
    headerBg: '#EDF3FA',
    primary: '#114A76',
    primarySoft: '#286DA6',
    textStrong: '#102A43',
    textBody: '#1F2937',
    textMuted: '#52606D',
    textSubtle: '#9AA5B1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#DC2626',
  },
  radius,
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    bg: '#0F1720',
    surface: '#16212D',
    surfaceAlt: '#1D2A38',
    border: '#2A3B4C',
    headerBg: '#1A2835',
    primary: '#69B3F2',
    primarySoft: '#4A9DE5',
    textStrong: '#E6EDF5',
    textBody: '#D1D9E2',
    textMuted: '#9AAABD',
    textSubtle: '#7B8DA1',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
  radius,
};

// Backward-compatible default for screens not yet migrated to dynamic theming.
export const theme = lightTheme;
