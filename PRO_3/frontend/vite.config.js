import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // <-- server block is now inside the object
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})