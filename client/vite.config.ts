import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Same-origin API in development, so the SameSite=Strict session cookie just works
    proxy: { '/api': 'http://localhost:4000' },
  },
});
