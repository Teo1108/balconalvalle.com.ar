import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'valle-brown': '#7A2B1E',
        'valle-sand':  '#D4B896',
        'valle-cream': '#FAF6F0',
        'valle-dark':  '#2C1810',
        background: "var(--background)",
        foreground: "var(--foreground)",
        'ellie-primary': '#370800',
        'ellie-primary-container': '#551a09',
        'ellie-on-primary-container': '#d67e66',
        'ellie-secondary': '#006e2e',
        'ellie-surface': '#fff8f6',
        'ellie-surface-low': '#fff1ed',
        'ellie-surface-container': '#faeae7',
        'ellie-surface-container-high': '#f5e5e1',
        'ellie-surface-container-highest': '#efdfdb',
        'ellie-surface-container-lowest': '#ffffff',
        'ellie-on-surface': '#221a18',
        'ellie-on-surface-variant': '#54433e',
        'ellie-outline-variant': '#dac1bb',
      },
      fontFamily: {
        'ellie-serif': ['var(--font-ellie-serif)'],
        'ellie-sans': ['var(--font-ellie-sans)'],
      },
    },
  },
  plugins: [],
};
export default config;
