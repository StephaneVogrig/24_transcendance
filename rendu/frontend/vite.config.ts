import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: ['frontend', 'localhost', '127.0.0.1'],
        hmr: false,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        assetsDir: 'assets'
    }
})
