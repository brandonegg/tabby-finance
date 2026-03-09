import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        tabby: {
          canvas: "#f4efe6",
          paper: "#fffaf2",
          cloud: "#edf1eb",
          ink: "#13261e",
          "ink-muted": "#365247",
          muted: "#67756d",
          line: "#d8ded5",
          accent: "#245c4a",
          "accent-strong": "#173d30",
          "accent-soft": "#dce8df",
          positive: "#2e7d57",
          "positive-soft": "#e4f1e8",
          warning: "#8f6a2a",
          "warning-strong": "#876221",
          "warning-soft": "#f6ebcf",
          danger: "#b65245",
          "danger-strong": "#a5483c",
          "danger-soft": "#f7e4df",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
