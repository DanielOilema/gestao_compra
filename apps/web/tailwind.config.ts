import type { Config } from "tailwindcss";
import uiPreset from "@gestao-compra/ui/tailwind-preset";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}",
  ],
  safelist: [
    "bg-emerald-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-blue-600",
    "bg-orange-500",
    "bg-gray-300",
  ],
  presets: [uiPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        status: {
          pending: "hsl(var(--status-pending))",
          "pending-foreground": "hsl(var(--status-pending-foreground))",
          "pending-bg": "hsl(var(--status-pending-bg))",
          blocked: "hsl(var(--status-blocked))",
          "blocked-foreground": "hsl(var(--status-blocked-foreground))",
          "blocked-bg": "hsl(var(--status-blocked-bg))",
          approved: "hsl(var(--status-approved))",
          "approved-foreground": "hsl(var(--status-approved-foreground))",
          "approved-bg": "hsl(var(--status-approved-bg))",
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
