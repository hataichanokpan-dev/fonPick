import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // =========================
      // SCREENS / BREAKPOINTS (Phase 1)
      // =========================
      screens: {
        'xs': '375px',  // Small mobile
        'sm': '640px',  // Standard mobile
        'md': '768px',  // Tablet
        'lg': '1024px', // Desktop
        'xl': '1280px', // Wide desktop
        '2xl': '1536px', // Extra wide desktop
      },

      colors: {
        // =========================
        // Background Hierarchy (from design_rules.md)
        // =========================
        'bg-primary': '#0a0e17',  // Deep near-black - main background
        'bg-surface': '#111827',  // Card background
        'bg-surface-2': '#1f2937', // Elevated surface, hover states
        'bg-surface-3': '#374151', // Active states

        // =========================
        // Border System (from design_rules.md)
        // =========================
        'border-subtle': '#1f2937',  // Subtle borders
        'border-default': '#374151', // Component borders
        'border-strong': '#4b5563',  // Focus states

        // =========================
        // Typography Colors (from design_rules.md)
        // =========================
        'text-primary': '#ffffff',   // Main content, hero numbers
        'text-secondary': '#a0a0a0', // Supporting text
        'text-tertiary': '#6b7280',  // Labels, metadata
        'text-disabled': '#4b5563',  // Disabled states

        // =========================
        // Signal Colors - Market Data (from design_rules.md)
        // =========================
        'up-primary': '#4ade80',     // Green - gains, positive
        'up-soft': 'rgba(74, 222, 128, 0.15)', // Background tint
        'up-mobile': '#4CAF50',      // Mobile green 500
        'down-primary': '#ff6b6b',   // Red - losses, negative
        'down-soft': 'rgba(255, 107, 107, 0.15)', // Background tint
        'down-mobile': '#F44336',    // Mobile red 500
        'neutral': '#9ca3af',        // Flat, no change

        // =========================
        // Accent Colors (from design_rules.md)
        // =========================
        'accent-blue': '#3b82f6',    // Charts, links, primary actions
        'accent-blue-dark': '#1e40af', // Chart fill
        'insight': '#f59e0b',        // Gold - AI insights
        'warning': '#f97316',        // Orange - warnings

        // =========================
        // Legacy aliases (for backward compatibility)
        // =========================
        bg: {
          DEFAULT: '#0a0e17',
          1: '#111827',
          2: '#1f2937',
        },
        surface: {
          DEFAULT: '#111827',
          1: '#1f2937',
          2: '#374151',
          3: '#4b5563',
          hover: '#1f2937',
        },
        border: {
          DEFAULT: '#1f2937',
          subtle: '#1f2937',
          1: '#374151',
          2: '#4b5563',
        },
        text: {
          DEFAULT: '#ffffff',
          1: '#a0a0a0',
          2: '#6b7280',
          3: '#4b5563',
          muted: '#6b7280',
          disabled: '#4b5563',
          inverse: '#0a0e17',
        },
        up: {
          DEFAULT: '#4ade80',
          primary: '#4ade80',
          soft: 'rgba(74, 222, 128, 0.15)',
          text: '#4ade80',
          bg: 'rgba(74, 222, 128, 0.15)',
        },
        down: {
          DEFAULT: '#ff6b6b',
          primary: '#ff6b6b',
          soft: 'rgba(255, 107, 107, 0.15)',
          text: '#ff6b6b',
          bg: 'rgba(255, 107, 107, 0.15)',
        },
        flat: {
          DEFAULT: '#9ca3af',
          soft: '#9ca3af',
        },

        // =========================
        // Chart-specific tokens
        // =========================
        chart: {
          bg: '#111827',
          grid: '#1f2937',
          axis: '#6b7280',
          line: '#ffffff',
          volume: '#4b5563',
          crosshair: '#1f2937',
          tooltipBg: '#1f2937',
          tooltipBorder: '#374151',
        },

        // =========================
        // Status / Info colors
        // =========================
        info: {
          DEFAULT: '#3b82f6',
          soft: '#93C5FD',
          deep: '#1e40af',
        },
        warn: {
          DEFAULT: '#f97316',
          soft: '#FDE68A',
          deep: '#d97706',
        },
        risk: {
          DEFAULT: '#ff6b6b',
          soft: '#FDA4AF',
          deep: '#E11D48',
        },

        // =========================
        // Overlay / Shadows
        // =========================
        overlay: {
          10: 'rgba(0,0,0,0.10)',
          20: 'rgba(0,0,0,0.20)',
          40: 'rgba(0,0,0,0.40)',
          60: 'rgba(0,0,0,0.60)',
        },

        // =========================
        // Additional legacy tokens for compatibility
        // =========================
        base: {
          background: '#0a0e17',
          surface: '#111827',
          surface_alt: '#1f2937',
          border: '#1f2937',
        },
        signal: {
          up_strong: '#4ade80',
          up_soft: 'rgba(74, 222, 128, 0.15)',
          down_soft: 'rgba(255, 107, 107, 0.15)',
          down_strong: '#ff6b6b',
          neutral: '#9ca3af',
        },
        flow: {
          buy: '#4ade80',
          sell: '#ff6b6b',
          neutral_bg: '#1f2937',
        },
        highlight: {
          insight: '#f59e0b',
          warning: '#f97316',
          info: '#3b82f6',
        },
        buy: {
          bg: 'rgba(74, 222, 128, 0.15)',
          DEFAULT: '#4ade80',
        },
        sell: {
          bg: 'rgba(255, 107, 107, 0.15)',
          DEFAULT: '#ff6b6b',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
        tabular: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        // Number display sizes (from design_rules.md)
        'number-hero': ['2rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }], // 32px
        'number-primary': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }], // 24px
        'number-secondary': ['1rem', { lineHeight: '1.25', fontWeight: '600' }], // 16px
        'number-tertiary': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }], // 14px

        // Standard font sizes (from design_rules.md)
        'xxs': ['0.6875rem', { lineHeight: '1.4' }], // 11px - Captions
        'xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.05em' }], // 12px - Labels
        'sm': ['0.875rem', { lineHeight: '1.6' }], // 14px - Body
        'base': ['1rem', { lineHeight: '1.6' }], // 16px - Body
        'lg': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }], // 18px - Card titles
        'xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }], // 24px - Section titles
        '2xl': ['2rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }], // 32px - Hero numbers
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      spacing: {
        // Spacing scale from design_rules.md (4px base)
        'space-1': '0.25rem',  // 4px - Micro spacing
        'space-2': '0.5rem',   // 8px - Small gaps
        'space-3': '0.75rem',  // 12px - Standard gap
        'space-4': '1rem',     // 16px - Medium spacing
        'space-5': '1.25rem',  // 20px - Large internal spacing
        'space-6': '1.5rem',   // 24px - Section spacing
        'space-8': '2rem',     // 32px - Component spacing
        'space-10': '2.5rem',  // 40px - Large sections
        'space-12': '3rem',    // 48px - Page margins

        // Component spacing from design_rules.md
        'card-padding': '1rem',      // 16px
        'card-gap-desktop': '1.5rem', // 24px
        'card-gap-mobile': '1rem',    // 16px
        'row-height-desktop': '3rem', // 48px
        'row-height-mobile': '3.5rem', // 56px
        'button-height-desktop': '2.5rem', // 40px
        'button-height-mobile': '2.75rem', // 44px

        // =========================
        // SAFE AREA SPACING (Phase 1)
        // =========================
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',

        // Legacy spacing
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'stock-card': '16rem',
        'chart-height': '20rem',
        'sidebar': '18rem',
      },

      // =========================
      // MAX WIDTH (Phase 1)
      // =========================
      maxWidth: {
        'mobile': '428px',
        'tablet': '768px',
        'desktop': '1280px',
        'desktop-wide': '1536px',
      },

      borderRadius: {
        // From design_rules.md
        'sm': '0.25rem',  // 4px
        'md': '0.5rem',   // 8px
        'lg': '0.75rem',  // 12px
        'xl': '1rem',     // 16px
        'xl2': '0.875rem', // 14px
        '4xl': '2rem',
        'card': '0.75rem',
        'card-lg': '1rem',
        'input': '0.5rem',
        'button': '0.5rem',
      },

      boxShadow: {
        hairline: '0 0 0 1px #1f2937',
        soft: '0 8px 24px rgba(0,0,0,0.35)',
        'stock-card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'stock-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'glow-up': '0 0 12px rgba(74, 222, 128, 0.4)',
        'glow-down': '0 0 12px rgba(255, 107, 107, 0.4)',
        'glow-insight': '0 0 12px rgba(245, 158, 11, 0.4)',
      },

      backgroundImage: {
        'logo-gradient': 'linear-gradient(to bottom right, #4ade80, #22c55e)',
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
          '50%': { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
        },
        priceDown: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255, 107, 107, 0.2)' },
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
