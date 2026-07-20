import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
  },
});
