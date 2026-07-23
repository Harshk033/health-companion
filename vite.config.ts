import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Add this import

export default defineConfig({
  base: '/health-companion/',
  plugins: [
    tailwindcss(), 
    react()
  ],
})
