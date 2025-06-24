/**
 * Design System Tokens for Bounty Platform
 * 
 * This file provides TypeScript constants for all design tokens
 * Use these instead of hardcoded values for consistency
 */

export const DesignTokens = {
  // Colors
  colors: {
    // Primary Colors
    primary: {
      blue: '#1B4F72',
      white: '#FFFFFF',
    },
    // Secondary Colors
    secondary: {
      blueLight: '#3498DB',
      bluePale: '#EBF5FF',
      gray: '#F8F9FA',
    },
    // Accent Colors
    accent: {
      green: '#27AE60',
      orange: '#F39C12',
      purple: '#8E44AD',
    },
    // Functional Colors
    functional: {
      success: '#2ECC71',
      error: '#E74C3C',
      warning: '#F1C40F',
      info: '#3498DB',
    },
    // Text Colors
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
      muted: '#BDC3C7',
    },
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      dark: '#34495E',
    },
    // Dark Mode Colors
    dark: {
      primary: '#1A202C',
      surface: '#2D3748',
      elevated: '#4A5568',
      text: {
        primary: '#F7FAFC',
        secondary: '#E2E8F0',
        muted: '#A0AEC0',
      },
      brand: {
        blue: '#4299E1',
        success: '#68D391',
        warning: '#F6AD55',
        error: '#FC8181',
      },
    },
    // Border Colors
    border: {
      default: '#E1E5E9',
      light: '#F1F2F6',
      focus: '#1B4F72',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    },
    fontSize: {
      // Headings
      h1: '32px',
      h2: '28px',
      h3: '24px',
      h4: '20px',
      // Body Text
      bodyLarge: '18px',
      body: '16px',
      bodySmall: '14px',
      // Special Text
      caption: '12px',
      button: '16px',
      link: '16px',
      label: '14px',
    },
    lineHeight: {
      h1: '40px',
      h2: '36px',
      h3: '32px',
      h4: '28px',
      bodyLarge: '28px',
      body: '24px',
      bodySmall: '20px',
      caption: '16px',
      button: '24px',
      link: '24px',
      label: '20px',
    },
    letterSpacing: {
      h1: '-0.3px',
      h2: '-0.2px',
      h3: '-0.1px',
      h4: '0px',
      bodyLarge: '0px',
      body: '0px',
      bodySmall: '0.1px',
      caption: '0.3px',
      button: '0.1px',
      link: '0px',
      label: '0.2px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing
  spacing: {
    micro: '2px',
    minimal: '4px',
    small: '8px',
    compact: '12px',
    default: '16px',
    medium: '24px',
    large: '32px',
    xl: '48px',
    max: '64px',
  },

  // Border Radius
  borderRadius: {
    button: '8px',
    card: '12px',
    bountyCard: '16px',
    search: '24px',
    progress: '4px',
  },

  // Shadows
  shadows: {
    card: '0 4px 12px rgba(0, 0, 0, 0.1)',
    bountyCard: '0 2px 8px rgba(0, 0, 0, 0.08)',
    bountyCardHover: '0 6px 16px rgba(0, 0, 0, 0.12)',
    focus: '0 0 0 3px rgba(27, 79, 114, 0.3)',
  },

  // Component Dimensions
  dimensions: {
    button: {
      height: '48px',
      textHeight: '44px',
      paddingX: '24px',
      paddingY: '12px',
    },
    input: {
      height: '56px',
      searchHeight: '48px',
      paddingX: '16px',
    },
    icons: {
      micro: '16px',
      small: '20px',
      standard: '24px',
      large: '32px',
      hero: '48px',
    },
  },

  // Animation
  animation: {
    duration: {
      micro: '150ms',
      standard: '250ms',
      emphasis: '350ms',
      modal: '300ms',
      page: '400ms',
      success: '500ms',
    },
    timing: {
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      emphasis: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      page: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
  },
} as const;

// Utility functions for accessing design tokens
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = DesignTokens.colors;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value || '#000000';
};

export const getSpacing = (size: keyof typeof DesignTokens.spacing) => {
  return DesignTokens.spacing[size];
};

export const getTypography = (element: keyof typeof DesignTokens.typography.fontSize) => {
  return {
    fontSize: DesignTokens.typography.fontSize[element],
    lineHeight: DesignTokens.typography.lineHeight[element],
    letterSpacing: DesignTokens.typography.letterSpacing[element],
  };
};

// CSS-in-JS style objects for common patterns
export const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: DesignTokens.typography.fontSize.button,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    lineHeight: DesignTokens.typography.lineHeight.button,
    letterSpacing: DesignTokens.typography.letterSpacing.button,
    borderRadius: DesignTokens.borderRadius.button,
    height: DesignTokens.dimensions.button.height,
    padding: `${DesignTokens.dimensions.button.paddingY} ${DesignTokens.dimensions.button.paddingX}`,
    transition: `all ${DesignTokens.animation.duration.standard} ${DesignTokens.animation.timing.easeOut}`,
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none',
  },
  primary: {
    backgroundColor: DesignTokens.colors.primary.blue,
    color: DesignTokens.colors.primary.white,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: DesignTokens.colors.primary.blue,
    border: `2px solid ${DesignTokens.colors.primary.blue}`,
  },
  success: {
    backgroundColor: DesignTokens.colors.functional.success,
    color: DesignTokens.colors.primary.white,
  },
  warning: {
    backgroundColor: DesignTokens.colors.accent.orange,
    color: DesignTokens.colors.primary.white,
  },
} as const;

export const cardStyles = {
  base: {
    backgroundColor: DesignTokens.colors.background.primary,
    borderRadius: DesignTokens.borderRadius.card,
    boxShadow: DesignTokens.shadows.card,
    border: `1px solid ${DesignTokens.colors.border.light}`,
    padding: DesignTokens.spacing.medium,
    transition: `box-shadow ${DesignTokens.animation.duration.standard} ${DesignTokens.animation.timing.easeOut}`,
  },
  bounty: {
    backgroundColor: DesignTokens.colors.background.primary,
    borderRadius: DesignTokens.borderRadius.bountyCard,
    boxShadow: DesignTokens.shadows.bountyCard,
    padding: DesignTokens.spacing.default,
    transition: `box-shadow ${DesignTokens.animation.duration.standard} ${DesignTokens.animation.timing.easeOut}`,
  },
} as const;