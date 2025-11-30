import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Permite acesso externo
    cors: true, // Habilita CORS
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desativa sourcemaps para simplificar
  },
  // Força o Vite a servir os arquivos corretamente
  appType: 'spa',
})
