import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files and system environment (Vercel)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Explicitly guarantee import.meta.env.VITE_IMGBB_API_KEY is defined from either
    // system process.env (Vercel build env) or loaded .env files
    define: {
      'import.meta.env.VITE_IMGBB_API_KEY': JSON.stringify(
        process.env.VITE_IMGBB_API_KEY || env.VITE_IMGBB_API_KEY || ''
      ),
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
