import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://gateway:3000',
        changeOrigin: true,
        ws: true // Support WebSocket pour Socket.IO
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Ignorer certains warnings pour le build
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      }
    }
  },
  optimizeDeps: {
    include: [
      '@babylonjs/core',
      'socket.io-client', 
      '@auth0/auth0-spa-js'
    ],
    exclude: [],
    force: true
  },
  define: {
    // Variables d'environnement globales pour Vite
    'import.meta.env.DEV': 'import.meta.env.DEV'
  },
  resolve: {
    alias: {
      // Alias pour simplifier les imports
      '@': '/src',
      '@3d': '/src/3d',
      '@pages': '/src/pages',
      '@auth': '/src/auth'
    }
  }
})