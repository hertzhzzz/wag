import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F2D5E',
        'navy-light': '#1A4A8A',
        'navy-dark': '#0A1F3D',
        amber: '#C97A0A',
        'amber-light': '#FBBF24',
        'amber-dark': '#D97706',
        'surface-warm': '#F8F9FB',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)'],
        serif: ['var(--font-ibm-plex-serif)'],
      },
      boxShadow: {
        'card-hover': '0 10px 15px rgba(15,45,94,0.1)',
      },
    },
  },
  plugins: [
    typography,
  ],
};
export default config;
