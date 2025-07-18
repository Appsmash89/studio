
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['PT Sans', 'sans-serif'],
        headline: ['Playfair Display', 'serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        flip: {
          from: { transform: 'rotateY(0deg)' },
          to: { transform: 'rotateY(1800deg)' },
        },
        'bulb-blink': {
            '0%, 100%': { fill: 'hsl(43, 98%, 68%)' },
            '50%': { fill: 'hsl(50, 100%, 80%)' },
        },
        'fly-to-target': {
          '0%': {
            transform: 'translate(calc(var(--start-x) - 50%), calc(var(--start-y) - 50%)) scale(1)',
            opacity: '1',
          },
          '40%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(0.75)',
            opacity: '0',
          },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        'confetti-blast': {
          '0%': {
            opacity: '1',
            transform: 'translate(var(--x-start), var(--y-start)) rotate(var(--rotation-start)) scale(1.2)',
          },
          '20%': {
            opacity: '1',
            transform: 'translate(var(--x-blast), var(--y-blast)) rotate(calc(var(--rotation-start) + 180deg)) scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate(var(--x-end), var(--y-end)) rotate(var(--rotation-end)) scale(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'flip': 'flip 3s ease-out forwards',
        'bulb-blink': 'bulb-blink 1.5s infinite',
        'fly-to-target': 'fly-to-target 0.3s cubic-bezier(0.175, 0.885, 0.32, 1) forwards',
        'bounce-in': 'bounce-in 0.3s ease-out forwards',
        'bounce-out': 'bounce-out 0.3s ease-in forwards',
        'confetti-blast': 'confetti-blast cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
