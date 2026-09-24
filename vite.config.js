import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': '',
        },
        cookiePathRewrite: {
          '*': '/',
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
              proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
                cookie.replace(/SameSite=None/gi, 'SameSite=Lax')
              );
            }
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
});
