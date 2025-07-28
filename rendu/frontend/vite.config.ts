import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: ['frontend', 'localhost', '127.0.0.1'],
        hmr: {
            protocol: 'wss',
            host: 'localhost',
            port: 3000,
            clientPort: 3000,
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        assetsDir: 'assets'
    }
})
