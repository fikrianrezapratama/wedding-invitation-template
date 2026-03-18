import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 25px 60px rgba(100, 54, 42, 0.18)"
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top, rgba(255,255,255,0.9), rgba(255,255,255,0.12) 50%), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))"
      }
    }
  },
  plugins: []
};

export default config;

