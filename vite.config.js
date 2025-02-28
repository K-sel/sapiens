import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        target: 'es6',
        emptyOutDir: true,
    },
    server: {
        host: true
    },
})