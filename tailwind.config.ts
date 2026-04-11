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
        amber: '#F59E0B',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)'],
        serif: ['var(--font-ibm-plex-serif)'],
      },
    },
  },
  plugins: [
    typography,
  ],
};
export default config;
