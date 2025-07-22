import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@tanstack/react-query'],
        },
      },
    },
  },
  define: {
    // Provide default values for environment variables
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3001/api'),
    'import.meta.env.VITE_NODE_ENV': JSON.stringify('development'),
  },
})
