/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          page: '#FFF9D2',
          card: '#F5EEC8',
          surface: '#EDE8B8',
          input: '#F0EBBA',
        },
        accent: {
          primary: '#8CC0EB',
          secondary: '#BFDDF0',
          warm: '#F4A35A',
        },
        text: {
          primary: '#1A1814',
          muted: '#6B6555',
          placeholder: '#A89F7E',
        },
      },
      fontFamily: {
        serif: ['InstrumentSerif-Regular'],
        sans: ['DMSans-Regular'],
        'sans-medium': ['DMSans-Medium'],
        'sans-semibold': ['DMSans-SemiBold'],
        mono: ['JetBrainsMono-Regular'],
      },
    },
  },
  plugins: [],
};
