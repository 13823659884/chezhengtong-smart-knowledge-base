/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-light': '#EBF4FF',
        success: '#52C41A',
        warning: '#FA8C16',
        danger: '#F5222D',
        purple: '#722ED1',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'border-color': '#E5E7EB',
        'input-bg': '#F3F4F6',
        'blue-tag': '#DBEAFE',
        'blue-text': '#2563EB',
        'green-tag': '#D1FAE5',
        'green-text': '#059669',
        'card-blue-from': '#2563EB',
        'card-blue-to': '#7C3AED',
        'card-green-from': '#059669',
        'card-green-to': '#13C2C2',
        'card-purple-from': '#7C3AED',
        'card-purple-to': '#EC4899',
      },
      maxWidth: {
        'app': '480px',
      },
    },
  },
  plugins: [],
}
