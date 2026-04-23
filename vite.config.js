import { defineConfig } from 'vite'
import react from '@vitejs/react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/premium-jobs/', // REPLACE THIS with your exact GitHub repository name
})


