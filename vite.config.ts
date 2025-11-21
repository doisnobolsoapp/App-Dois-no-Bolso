import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Estratégia automática que só agrupa o que existe
          if (id.includes('node_modules')) {
            // Separa React em seu próprio chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Separa outras bibliotecas conhecidas se existirem
            if (id.includes('chart') || id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Todas as outras bibliotecas vão para vendor
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
