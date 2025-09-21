import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL)
  }
})
