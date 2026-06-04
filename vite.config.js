import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/yuqing_frontend/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
