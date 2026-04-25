import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          void: "#07080f",
          panel: "#101522",
          line: "#243041",
          glow: "#60f3ff",
          pulse: "#ff4fd8",
          gold: "#ffd166",
          lime: "#8bff9f"
        }
      },
      boxShadow: {
        neon: "0 0 36px rgba(96, 243, 255, 0.24)",
        magenta: "0 0 36px rgba(255, 79, 216, 0.2)"
      },
      backgroundImage: {
        grid:
          "linear-gradient(rgba(96,243,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96,243,255,.08) 1px, transparent 1px)"
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite"
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 26px rgba(96, 243, 255, .18)" },
          "50%": { boxShadow: "0 0 46px rgba(255, 79, 216, .22)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
