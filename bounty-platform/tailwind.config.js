/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          blue: '#1B4F72',
          white: '#FFFFFF',
        },
        // Secondary Colors
        secondary: {
          'blue-light': '#3498DB',
          'blue-pale': '#EBF5FF',
          gray: '#F8F9FA',
        },
        // Accent Colors
        accent: {
          green: '#27AE60',
          orange: '#F39C12',
          purple: '#8E44AD',
        },
        // Functional Colors
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F1C40F',
        info: '#3498DB',
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
          DEFAULT: '#E1E5E9',
          light: '#F1F2F6',
          focus: '#1B4F72',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Headings
        'h1': ['32px', { lineHeight: '40px', letterSpacing: '-0.3px', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '36px', letterSpacing: '-0.2px', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '32px', letterSpacing: '-0.1px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '600' }],
        // Body Text
        'body-large': ['18px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '400' }],
        // Special Text
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.3px', fontWeight: '500' }],
        'button': ['16px', { lineHeight: '24px', letterSpacing: '0.1px', fontWeight: '600' }],
        'link': ['16px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '500' }],
        'label': ['14px', { lineHeight: '20px', letterSpacing: '0.2px', fontWeight: '500' }],
      },
      spacing: {
        '2': '2px',   // Micro spacing
        '4': '4px',   // Minimal spacing
        '8': '8px',   // Small spacing
        '12': '12px', // Compact spacing
        '16': '16px', // Default spacing
        '24': '24px', // Medium spacing
        '32': '32px', // Large spacing
        '48': '48px', // Extra large spacing
        '64': '64px', // Maximum spacing
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
        'bounty-card': '16px',
        'search': '24px',
        'progress': '4px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'bounty-card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'bounty-card-hover': '0 6px 16px rgba(0, 0, 0, 0.12)',
        'focus': '0 0 0 3px rgba(27, 79, 114, 0.3)',
      },
      height: {
        'button': '48px',
        'text-button': '44px',
        'input': '56px',
        'search-input': '48px',
      },
      animation: {
        'pulse-loading': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionDuration: {
        'micro': '150ms',
        'standard': '250ms',
        'emphasis': '350ms',
        'modal': '300ms',
        'page': '400ms',
        'success': '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
        'emphasis': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'page': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}