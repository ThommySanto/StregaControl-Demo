import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const repoName = 'StregaControl-Demo'

// Config Vite: plugin React + alias "@/" -> "src/" per import puliti
// tra i moduli (auth, map, elements, editions, ecc.)
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
