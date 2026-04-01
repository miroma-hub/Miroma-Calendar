
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo atual
  // Fix: Cast process to any to access cwd() method in environments without Node types
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
