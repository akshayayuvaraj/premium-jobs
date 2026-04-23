import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ensures assets are loaded from the root domain
  base: '/', 
  build: {
    // Helps with the 'large chunks' warning you saw in the terminal
    chunkSizeWarningLimit: 1600,
  },
})