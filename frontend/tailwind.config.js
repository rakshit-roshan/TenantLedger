/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: '#F4ECDF',
        surface: '#FBF7EF',
        ink: '#2A1F17',
        sidebar: '#2A1F17',
        terracotta: '#A8481F',
        paid: '#5F7A3E',
        due: '#C98A1B',
        overdue: '#9C2F2A',
        notice: '#2F6B6B',
        line: '#DDCFB8',
        'subtle-line': '#E2D5BF',
        'muted-text': '#5E4E41',
        'floor-ground': '#EADDC8',
        'floor-line': '#C8B28C',
        'table-dotted': '#B9A78A',
        'sidebar-text': '#EFE4D2',
        'sidebar-active': '#F4ECDF',
        'btn-border': '#CDBBA0',
      },
      fontFamily: {
        serif: ['"Young Serif"', 'Georgia', 'serif'],
        sans: ['"Figtree"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'unit': '14px 14px 4px 4px',
        'sheet': '24px',
      },
      boxShadow: {
        'ledger': '0 2px 6px rgba(42, 31, 23, 0.05)',
        'float': '0 8px 24px rgba(42, 31, 23, 0.12)',
      }
    },
  },
  plugins: [],
}

