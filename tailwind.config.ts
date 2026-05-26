import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: {
          primary:   '#0a0a0f',
          secondary: '#111118',
          card:      '#16161f',
          border:    '#1e1e2e',
        },
        accent: {
          cyan:   '#00d4ff',
          violet: '#7c3aed',
          green:  '#00ff88',
          amber:  '#ffb800',
          red:    '#ff4466',
          pink:   '#ff2d78',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px #00d4ff33' },
          to:   { boxShadow: '0 0 30px #00d4ff66, 0 0 60px #00d4ff22' },
        },
        'border-spin': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        float:        'float 6s ease-in-out infinite',
        glow:         'glow 2s ease-in-out infinite alternate',
        'border-spin':'border-spin 4s ease infinite',
      },
    },
  },
  plugins: [],
}

export default config