// DCIAFRICA Theme Colors - Based on index.html design
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f4ff',
    100: '#e0eaff',
    200: '#c7d8ff',
    300: '#a4bcff',
    400: '#8196ff',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#0c1e59', // Main primary color from design
    950: '#0a183f'  // Darker variant
  },
  
  // Secondary/Teal Colors  
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#00b9ae', // Main secondary color from design
    600: '#00857a', // Darker teal
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e'
  },
  
  // Accent/Yellow Colors
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24', // Main accent color from design
    500: '#f59e0b',
    600: '#e0a923', // Darker yellow
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  
  // Neutral/Gray Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },
  
  // Semantic Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  }
};

// Color aliases for easier usage
export const themeColors = {
  // Main brand colors
  primaryBlue: colors.primary[900],    // #0c1e59
  darkBlue: colors.primary[950],       // #0a183f
  teal: colors.secondary[500],         // #00b9ae
  darkTeal: colors.secondary[600],     // #00857a
  yellow: colors.accent[400],          // #fbbf24
  darkYellow: colors.accent[600],      // #e0a923
  
  // Background colors
  bgPrimary: colors.primary[900],
  bgSecondary: colors.primary[950],
  bgLight: colors.neutral[50],
  bgCard: colors.neutral[100],
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: colors.neutral[300],
  textDark: colors.primary[900],
  textMuted: colors.neutral[600],
  
  // Border colors
  border: colors.neutral[200],
  borderDark: colors.neutral[700],
  
  // State colors
  success: colors.success[500],
  error: colors.error[500],
  warning: colors.warning[500],
  
  // Gradient colors
  gradientFrom: colors.accent[400],    // #fbbf24
  gradientTo: colors.secondary[500]    // #00b9ae
};
