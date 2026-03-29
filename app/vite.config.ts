import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production site is emitted to ../www (upload that folder to your host document root).
// For GitHub Pages under a subpath, set base to '/your-repo-name/' and adjust hosting.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: '../www',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
    },
  },
})
