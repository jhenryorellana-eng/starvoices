import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F4F4F1',
        'soft-black': '#1A1A1A',
        border: '#E5E5E5',
        primary: {
          DEFAULT: '#C8963E',
          50: '#fdf8f0',
          100: '#faf0dc',
          200: '#f5ddb5',
          300: '#efc584',
          400: '#C8963E',
          500: '#B07E2E',
          600: '#8F6520',
          700: '#6F4E19',
          800: '#563D14',
          900: '#3D2B0F',
        },
        'utah-red': {
          DEFAULT: '#B8453A',
          50: '#fef2f1',
          100: '#fde3e0',
          200: '#fbc8c3',
          300: '#f7a198',
          400: '#B8453A',
          500: '#9C3830',
          600: '#7E2D27',
        },
        'utah-navy': {
          DEFAULT: '#1E3A5F',
          50: '#f0f4f9',
          100: '#dce5f0',
          200: '#b8cbe1',
          300: '#7fa3c8',
          400: '#3d6a96',
          500: '#1E3A5F',
          600: '#162c49',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#666666',
          600: '#4d4d4d',
          700: '#333333',
          800: '#262626',
          900: '#1A1A1A',
        },
        background: {
          light: '#F4F4F1',
          DEFAULT: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'DM Serif Display', 'Georgia', 'serif'],
      },
      keyframes: {
        'waveform-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'waveform-bar-idle': {
          '0%, 100%': { transform: 'scaleY(0.15)' },
          '50%': { transform: 'scaleY(0.3)' },
        },
        'shimmer-gold': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'waveform-bar': 'waveform-bar 1s ease-in-out infinite',
        'waveform-bar-idle': 'waveform-bar-idle 2s ease-in-out infinite',
        'shimmer-gold': 'shimmer-gold 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
