import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        xmeta: {
          panel: "hsl(var(--xmeta-panel))",
          raised: "hsl(var(--xmeta-raised))",
          inset: "hsl(var(--xmeta-inset))",
          canvas: "hsl(var(--xmeta-canvas))",
          border: "hsl(var(--xmeta-border))",
          grid: "hsl(var(--xmeta-grid))",
          muted: "hsl(var(--xmeta-muted))",
          info: {
            DEFAULT: "hsl(var(--xmeta-info))",
            bg: "hsl(var(--xmeta-info-bg))",
            border: "hsl(var(--xmeta-info-border))",
          },
          progress: {
            DEFAULT: "hsl(var(--xmeta-progress))",
            bg: "hsl(var(--xmeta-progress-bg))",
            border: "hsl(var(--xmeta-progress-border))",
          },
          success: {
            DEFAULT: "hsl(var(--xmeta-success))",
            bg: "hsl(var(--xmeta-success-bg))",
            border: "hsl(var(--xmeta-success-border))",
          },
          warning: {
            DEFAULT: "hsl(var(--xmeta-warning))",
            bg: "hsl(var(--xmeta-warning-bg))",
            border: "hsl(var(--xmeta-warning-border))",
          },
          danger: {
            DEFAULT: "hsl(var(--xmeta-danger))",
            bg: "hsl(var(--xmeta-danger-bg))",
            border: "hsl(var(--xmeta-danger-border))",
          },
          selected: {
            DEFAULT: "hsl(var(--xmeta-selected))",
            bg: "hsl(var(--xmeta-selected-bg))",
            border: "hsl(var(--xmeta-selected-border))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "xmeta-panel": "0 16px 40px hsl(222 28% 8% / 0.12)",
        "xmeta-raised": "0 24px 70px hsl(222 28% 8% / 0.18)",
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
