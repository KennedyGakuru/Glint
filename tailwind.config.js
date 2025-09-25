/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          900: '#1e3a8a',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
        },
        accent: '#22c55e',
        warning: '#f59e0b',
        card: {
          light: '#f8fafc',
          dark: '#0f172a',
        },
        bg: {
          light: '#ffffff',
          dark: '#0b0f1a',
        }
      },
      fontSize: {
        'display': ['32px', '38px'],
        'headline': ['24px', '30px'],
        'title': ['20px', '26px'],
        'body': ['16px', '22px'],
        'caption': ['13px', '18px'],
      },
      borderRadius: {
        'card': '16px',
      }
    },
  },
  plugins: [],
};