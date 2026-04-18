import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B3A4B",
        "primary-light": "#2D5F73",
        "primary-dark": "#122831",
        "page-bg": "#FAF9F6",
        "ink-primary": "#1A1A2E",
        "ink-secondary": "#4A5568",
        "ink-muted": "#94A3B8",
        gain: "#059669",
        loss: "#DC2626",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
