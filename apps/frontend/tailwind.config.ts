import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        iinicia: {
          navy: '#0b2534',
          primary: '#0f3d3e',
          teal: '#14b8a6',
          light: '#f0fdfa',
          gold: '#d97706',
        },
      },
    },
  },
  plugins: [],
};

export default config;
