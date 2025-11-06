import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
    proxy: {
      '/rest': {  // Proxy /rest → backend 8080
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
  },
});

