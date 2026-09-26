/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Toyota: Rojo Toyota #EB0A1E · Gris Toyota #58595B · Blanco #FFFFFF · Negro #000000
        primary: {
          50: '#FFF1F2',
          100: '#FFE0E3',
          200: '#FFC5CA',
          300: '#FF9BA4',
          400: '#FC6472',
          500: '#F52A3E',
          600: '#EB0A1E', // Rojo Toyota
          700: '#C40817',
          800: '#9E0713',
          900: '#7A060F',
          950: '#4A0308',
        },
        // Rojo semántico (peligro / eliminar) alineado a la misma familia del rojo Toyota
        red: {
          50: '#FFF1F2',
          100: '#FFE0E3',
          200: '#FFC5CA',
          300: '#FF9BA4',
          400: '#FC6472',
          500: '#F52A3E',
          600: '#EB0A1E',
          700: '#C40817',
          800: '#9E0713',
          900: '#7A060F',
          950: '#4A0308',
        },
        // Grises neutros (sin tinte azulado) anclados en el Gris Toyota #58595B
        gray: {
          50: '#F7F7F7',
          100: '#EDEDEE',
          200: '#DEDFDF',
          300: '#C5C6C7',
          400: '#949597',
          500: '#58595B', // Gris Toyota
          600: '#4A4B4D',
          700: '#3D3E40',
          800: '#313234',
          900: '#252627',
          950: '#17181A',
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
      animation: {
        'slide-in': 'slideIn .3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
