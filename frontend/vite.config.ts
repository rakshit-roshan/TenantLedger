import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load centralized .env from the parent repository directory
  const rootDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, rootDir, '');

  const frontendPort = parseInt(env.FRONTEND_PORT || env.VITE_PORT || '5173', 10);
  const serverPort = parseInt(env.SERVER_PORT || '8080', 10);
  const backendUrl = env.BACKEND_URL || env.VITE_BACKEND_URL || `http://localhost:${serverPort}`;
  const contextPath = env.SERVER_CONTEXT_PATH || env.API_BASE_URL || '/api/v1';

  return {
    envDir: '../',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      '__APP_NAME__': JSON.stringify(env.APP_NAME || 'Gharkhata'),
      '__APP_DISPLAY_NAME__': JSON.stringify(env.APP_DISPLAY_NAME || 'Gharkhata (घरखाता)'),
      '__API_BASE_URL__': JSON.stringify(contextPath),
      '__BACKEND_URL__': JSON.stringify(backendUrl),
    },
    server: {
      port: frontendPort,
      host: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
