// gas-delivery/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy'; // <-- Importamos el plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // <-- Agregamos la configuración legacy
    legacy({
      targets: ['defaults', 'not IE 11'], 
      // 'defaults' cubre el 90% de navegadores (incluyendo iOS Safari 12+ y Chrome viejo)
    })
  ],
});