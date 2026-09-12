/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Corporate navy palette - sobrio y profesional
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        // Success: verde apagado
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#2d6a4f',
          600: '#1b4332',
        },
        // Danger: rojo sobrio
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#b91c1c',
          600: '#991b1b',
        },
        // Warning: ámbar corporativo
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#b45309',
          600: '#92400e',
        },
      },
    },
  },
  plugins: [],
};
