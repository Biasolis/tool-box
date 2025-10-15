import { fileURLToPath, URL } from 'node:url' // Importa utilitários do Node.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  // Bloco de configuração para resolver caminhos (paths)
  resolve: {
    alias: {
      // Define o alias '@' para apontar para o diretório './src'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})