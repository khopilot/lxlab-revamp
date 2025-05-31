/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables class-based dark mode (e.g., <html class="dark">)
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          DEFAULT: '#50C878', // Emerald Green
          light: '#7AD699',
          dark: '#3A9A5A',
        },
        secondary: {
          DEFAULT: '#FFD700', // Golden Yellow
          light: '#FFDF4D',
          dark: '#CCAC00',
        },
        navy: {
          DEFAULT: '#1B2951', // Deep Navy
          light: '#2C3E6F',
          dark: '#111A33',
        },
        white: {
          DEFAULT: '#FAFAFA', // Soft White
          pure: '#FFFFFF',
          off: '#F5F5F5',
        },
        // Accent colors
        accent: {
          coral: '#FF6B6B', // Coral Pink
          blue: '#87CEEB', // Sky Blue
          orange: '#FFA500', // Warm Orange
        },
        // Semantic colors
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '"Noto Sans Khmer"', // Support for Khmer Unicode
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        heading: [
          '"Poppins"',
          '"Noto Sans Khmer"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'h1': '28px',
        'h2': '24px',
        'h3': '20px',
        'body': '16px',
        'caption': '14px',
      },
      fontWeight: {
        thin: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        // 8-point spacing system
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        '40': '160px',
        '48': '192px',
        '56': '224px',
        '64': '256px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'button': '8px', // Buttons
        'DEFAULT': '8px',
        'md': '10px',
        'card': '12px', // Cards
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        // 4 levels of shadow depth
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.1)',
        // Glassmorphism shadows
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-md': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.15)',
        'none': 'none',
      },
      backdropBlur: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      transitionDuration: {
        'DEFAULT': '300ms', // Animation timing
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Golden ratio proportions (approximately 1:1.618)
      aspectRatio: {
        'golden': '1.618 / 1',
        'golden-reverse': '1 / 1.618',
      },
      // Glassmorphism effects support
      backgroundOpacity: {
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '60': '0.6',
        '80': '0.8',
      },
    },
    // Responsive breakpoints
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    // Add any additional plugins here
    function ({ addUtilities }) {
      const newUtilities = {
        '.glassmorphism': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)', // Safari support
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
        '.glassmorphism-dark': {
          'background': 'rgba(27, 41, 81, 0.7)', // Adjusted for dark mode
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)', // Safari support
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.2)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'dark']) // Added 'dark' variant for glassmorphism-dark
    },
  ],
}
