import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: ['frontend', 'localhost', '127.0.0.1', '1f2.42angouleme.fr'],
        // PopUp : Configuration pour autoriser les popups et messages
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'unsafe-none'
        },
        // PopUp : Désactiver le strict mode pour les popups
        strictPort: false, 
        open: false // Ne pas ouvrir automatiquement le navigateur
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        assetsDir: 'assets'
    }
})
