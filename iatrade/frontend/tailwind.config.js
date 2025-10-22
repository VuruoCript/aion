/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#00d28a',
          50: '#e6fdf5',
          100: '#ccfbeb',
          200: '#99f7d7',
          300: '#66f3c3',
          400: '#33efaf',
          500: '#00d28a',
          600: '#00a86e',
          700: '#007e52',
          800: '#005437',
          900: '#002a1b',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 210, 138, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 210, 138, 0.4)',
      }
    },
  },
  plugins: [],
}
