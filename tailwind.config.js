export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'dark-card': '#111827',
        'dark-border': '#1F2937',
        'electric-blue': '#0EA5E9',
        'text-secondary': '#9CA3AF'
      },
      borderRadius: {
        card: '12px'
      },
      backdropBlur: {
        'nav': '8px'
      }
    }
  },
  plugins: []
}
