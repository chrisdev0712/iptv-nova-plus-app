import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Essential for Smart TVs (Tizen, webOS) and Capacitor local file loading
  server: {
    port: 3000,
    host: true
  }
});

