import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/snubugo-magazine/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 3012,
    host: true,
    proxy: {
      '/api/pdf': {
        target: 'https://firebasestorage.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/pdf/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[프록시 에러]', err);
          });
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            console.log('[프록시 요청]', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            console.log('[프록시 응답]', proxyRes.statusCode);
          });
        }
      }
    }
  },
  worker: {
    format: 'es'
  },
  define: {
    global: 'globalThis',
  },
})
