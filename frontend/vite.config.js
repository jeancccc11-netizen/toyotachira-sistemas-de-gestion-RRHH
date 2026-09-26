import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Expone el dev server en la red local (p. ej. http://192.168.x.x:5173 desde el celular)
    host: true,
    port: 5173,
    proxy: {
      // Fotos y archivos subidos (rutas /uploads del backend)
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
