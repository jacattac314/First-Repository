import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Senior-friendly font sizes (larger than default)
      fontSize: {
        'base': ['18px', { lineHeight: '1.75' }],
        'lg': ['20px', { lineHeight: '1.75' }],
        'xl': ['24px', { lineHeight: '1.5' }],
        '2xl': ['28px', { lineHeight: '1.4' }],
        '3xl': ['32px', { lineHeight: '1.3' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
      // High contrast color palette
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          dark: '#004C99',
          light: '#3385D6',
        },
        secondary: {
          DEFAULT: '#FF6B35',
          dark: '#E55A2B',
          light: '#FF8558',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      // Spacing for touch-friendly targets
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;
