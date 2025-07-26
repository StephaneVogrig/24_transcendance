import { defineConfig } from 'vite'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
        key: fs.readFileSync(path.resolve(__dirname, './ssl/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './ssl/cert.pem')),
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
    sourcemap: true
  }
})