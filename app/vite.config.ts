import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Must match the URL path where the site is served (leading + trailing slash).
// Domain root: use '/'. Subfolder like sandyzie.in/jagdambaautomobiles: use below.
export default defineConfig({
  plugins: [react()],
  base: '/jagdambaautomobiles/',
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
