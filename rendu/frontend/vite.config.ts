import { defineConfig } from 'vite'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: {
        key: fs.readFileSync(path.resolve(__dirname, '/app/ssl/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, '/app/ssl/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://gateway:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets'
  }
})