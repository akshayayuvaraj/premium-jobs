import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // This matches your GitHub repository name exactly
  base: '/premium-jobs/', 
})