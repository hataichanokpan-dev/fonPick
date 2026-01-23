import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors - Background and surface colors
        base: {
          background: '#0F172A',
          surface: '#111827',
          surface_alt: '#1F2937',
          border: '#273449',
        },

        // Text colors
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
          inverse: '#020617',
        },

        // Signal colors - Price movement indicators
        signal: {
          up_strong: '#22C55E',
          up_soft: '#86EFAC',
          down_soft: '#FECACA',
          down_strong: '#EF4444',
          neutral: '#94A3B8',
        },

        // Flow colors - Buy/Sell indicators with opacity support
        flow: {
          buy: '#16A34A',
          sell: '#DC2626',
          neutral_bg: '#1F2937',
        },

        // Highlight colors - Insights, warnings, info
        highlight: {
          insight: '#F59E0B',
          warning: '#FB7185',
          info: '#60A5FA',
        },

        // Semantic color aliases for better developer experience
        up: {
          bg: 'rgba(34, 197, 94, 0.1)',
          strong: '#22C55E',
          soft: '#86EFAC',
          DEFAULT: '#22C55E',
        },
        down: {
          bg: 'rgba(239, 68, 68, 0.1)',
          strong: '#EF4444',
          soft: '#FECACA',
          DEFAULT: '#EF4444',
        },
        buy: {
          bg: 'rgba(22, 163, 74, 0.1)',
          DEFAULT: '#16A34A',
        },
        sell: {
          bg: 'rgba(220, 38, 38, 0.1)',
          DEFAULT: '#DC2626',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Thai-optimized font sizes
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Stock-specific spacing
        'stock-card': '16rem',
        'chart-height': '20rem',
        'sidebar': '18rem',
      },

      borderRadius: {
        '4xl': '2rem',
        // Card-specific radii
        'card': '0.75rem',
        'card-lg': '1rem',
        'input': '0.5rem',
        'button': '0.5rem',
      },

      boxShadow: {
        'stock-card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'stock-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'glow-up': '0 0 12px rgba(34, 197, 94, 0.4)',
        'glow-down': '0 0 12px rgba(239, 68, 68, 0.4)',
        'glow-insight': '0 0 12px rgba(245, 158, 11, 0.4)',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'price-up': 'priceUp 0.3s ease-out',
        'price-down': 'priceDown 0.3s ease-out',
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        priceUp: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
        },
        priceDown: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
        },
      },

      backdropBlur: {
        'card': '12px',
      },

      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} satisfies Config
