/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5FAF8',
          100: '#EAF4F0',
          200: '#CBE5DC',
          300: '#ABD5C8',
          400: '#7B8C86', // accentCalm
          500: '#5A9E88',
          600: '#1F4D3A', // accentPrimary
          700: '#183C2D',
          800: '#122D22',
          900: '#0B1E16',
        },
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(200, 146, 74, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(31, 77, 58, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(123, 140, 134, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(242, 231, 219, 0.8) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
