import { colors, themeColors } from './colors.js';
import { typography, spacing, borderRadius, boxShadow, animations } from './typography.js';

// Main theme configuration
export const theme = {
  colors,
  themeColors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animations,
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        background: themeColors.yellow,
        color: themeColors.primaryBlue,
        hover: {
          background: themeColors.darkYellow
        }
      },
      secondary: {
        background: 'transparent',
        color: themeColors.textPrimary,
        border: `2px solid ${themeColors.teal}`,
        hover: {
          background: `${themeColors.teal}20`
        }
      },
      teal: {
        background: themeColors.teal,
        color: themeColors.textPrimary,
        hover: {
          background: themeColors.darkTeal
        }
      }
    },
    
    card: {
      default: {
        background: themeColors.bgCard,
        border: `1px solid ${themeColors.border}`,
        borderRadius: borderRadius.xl,
        boxShadow: boxShadow.lg
      },
      dark: {
        background: `${themeColors.teal}50`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${themeColors.teal}30`,
        borderRadius: borderRadius.xl
      }
    },
    
    input: {
      default: {
        background: themeColors.bgLight,
        border: `1px solid ${themeColors.border}`,
        borderRadius: borderRadius.lg,
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
        focus: {
          outline: 'none',
          ring: `2px solid ${themeColors.teal}`,
          borderColor: themeColors.teal
        }
      },
      dark: {
        background: `${colors.primary[800]}`,
        border: `1px solid ${colors.neutral[600]}`,
        color: themeColors.textPrimary,
        borderRadius: borderRadius.lg,
        padding: `${spacing[3]} ${spacing[4]}`,
        focus: {
          outline: 'none',
          ring: `2px solid ${themeColors.teal}`,
          borderColor: themeColors.teal
        }
      }
    }
  },
  
  // Layout utilities
  layout: {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: `0 ${spacing[6]}`
    },
    
    section: {
      padding: `${spacing[24]} ${spacing[6]}`
    }
  },
  
  // Gradients
  gradients: {
    primary: `linear-gradient(90deg, ${themeColors.yellow}, ${themeColors.teal})`,
    dark: `linear-gradient(to bottom, ${themeColors.primaryBlue}, ${themeColors.darkBlue})`,
    teal: `linear-gradient(to right, ${themeColors.teal}, ${themeColors.darkTeal})`
  }
};

// CSS custom properties for use in components
export const cssVariables = {
  '--color-primary': themeColors.primaryBlue,
  '--color-primary-dark': themeColors.darkBlue,
  '--color-secondary': themeColors.teal,
  '--color-secondary-dark': themeColors.darkTeal,
  '--color-accent': themeColors.yellow,
  '--color-accent-dark': themeColors.darkYellow,
  '--color-text-primary': themeColors.textPrimary,
  '--color-text-secondary': themeColors.textSecondary,
  '--color-text-dark': themeColors.textDark,
  '--color-bg-primary': themeColors.bgPrimary,
  '--color-bg-secondary': themeColors.bgSecondary,
  '--color-bg-light': themeColors.bgLight,
  '--gradient-primary': theme.gradients.primary,
  '--gradient-dark': theme.gradients.dark,
  '--gradient-teal': theme.gradients.teal,
  '--font-family-primary': typography.fontFamily.primary.join(', '),
  '--border-radius-base': borderRadius.base,
  '--border-radius-lg': borderRadius.lg,
  '--border-radius-xl': borderRadius.xl,
  '--shadow-lg': boxShadow.lg,
  '--transition-base': animations.transition.base
};

export default theme;
