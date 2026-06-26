import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border-hsl))",
        input: "hsl(var(--input-hsl))",
        ring: "hsl(var(--ring-hsl))",
        background: "hsl(var(--background-hsl))",
        foreground: "hsl(var(--foreground-hsl))",
        primary: {
          DEFAULT: "hsl(var(--primary-hsl))",
          foreground: "hsl(var(--primary-foreground-hsl))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary-hsl))",
          foreground: "hsl(var(--secondary-foreground-hsl))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive-hsl))",
          foreground: "hsl(var(--destructive-foreground-hsl))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-hsl))",
          foreground: "hsl(var(--muted-foreground-hsl))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "hsl(var(--accent-foreground-hsl))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover-hsl))",
          foreground: "hsl(var(--popover-foreground-hsl))",
        },
        card: {
          DEFAULT: "hsl(var(--card-hsl))",
          foreground: "hsl(var(--card-foreground-hsl))",
        },
        xmeta: {
          panel: "hsl(var(--xmeta-panel-hsl))",
          raised: "hsl(var(--xmeta-raised-hsl))",
          inset: "hsl(var(--xmeta-inset-hsl))",
          canvas: "hsl(var(--xmeta-canvas-hsl))",
          border: "hsl(var(--xmeta-border-hsl))",
          grid: "hsl(var(--xmeta-grid-hsl))",
          muted: "hsl(var(--xmeta-muted-hsl))",
          info: {
            DEFAULT: "hsl(var(--xmeta-info-hsl))",
            bg: "hsl(var(--xmeta-info-bg-hsl))",
            border: "hsl(var(--xmeta-info-border-hsl))",
          },
          progress: {
            DEFAULT: "hsl(var(--xmeta-progress-hsl))",
            bg: "hsl(var(--xmeta-progress-bg-hsl))",
            border: "hsl(var(--xmeta-progress-border-hsl))",
          },
          success: {
            DEFAULT: "hsl(var(--xmeta-success-hsl))",
            bg: "hsl(var(--xmeta-success-bg-hsl))",
            border: "hsl(var(--xmeta-success-border-hsl))",
          },
          warning: {
            DEFAULT: "hsl(var(--xmeta-warning-hsl))",
            bg: "hsl(var(--xmeta-warning-bg-hsl))",
            border: "hsl(var(--xmeta-warning-border-hsl))",
          },
          danger: {
            DEFAULT: "hsl(var(--xmeta-danger-hsl))",
            bg: "hsl(var(--xmeta-danger-bg-hsl))",
            border: "hsl(var(--xmeta-danger-border-hsl))",
          },
          selected: {
            DEFAULT: "hsl(var(--xmeta-selected-hsl))",
            bg: "hsl(var(--xmeta-selected-bg-hsl))",
            border: "hsl(var(--xmeta-selected-border-hsl))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "xmeta-panel": "0 16px 40px hsl(var(--foreground-hsl) / 0.08)",
        "xmeta-raised": "0 24px 70px hsl(var(--foreground-hsl) / 0.12)",
      },
      transitionDuration: {
        "xmeta-fast": "140ms",
        "xmeta-base": "220ms",
        "xmeta-slow": "360ms",
      },
      transitionTimingFunction: {
        xmeta: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      zIndex: {
        shell: "20",
        toolbar: "30",
        inspector: "40",
        overlay: "50",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;
