/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/3d/main3d.ts",
    "./src/3d/**/*.{js,ts,jsx,tsx}",
	'./src/html/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        'pong-blue': '#0ea5e9',
        'pong-green': '#10b981',
        'pong-purple': '#8b5cf6',
      },
      fontFamily: {
        'game': ['Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}