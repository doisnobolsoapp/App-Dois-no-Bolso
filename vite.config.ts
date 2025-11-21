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
        manualChunks: {
          // Agrupa React e React DOM
          'vendor-react': ['react', 'react-dom'],
          // Agrupa bibliotecas de UI (se estiver usando)
          'vendor-ui': [
            '@headlessui/react', 
            '@heroicons/react',
            'lucide-react'
          ],
          // Agrupa bibliotecas de utilitários
          'vendor-utils': [
            'date-fns', 
            'lodash', 
            'axios',
            'uuid'
          ],
          // Agrupa bibliotecas de gráficos (se estiver usando)
          'vendor-charts': [
            'recharts',
            'chart.js',
            'react-chartjs-2'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600,
    // Otimizações adicionais
    minify: 'esbuild',
    target: 'esnext'
  },
  // Otimização para desenvolvimento também
  optimizeDeps: {
    include: ['react', 'react-dom', 'date-fns']
  }
})
