import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // より明示的：すべてのネットワークインターフェースでリッスン
    port: 8080, // 5173から8080に変更（アクセス問題の診断のため）
    strictPort: false, // ポートが使用中の場合、別のポートを試す
    proxy: {
      // ローカル開発用: Vercel Dev (localhost:3000) へAPIリクエストをプロキシ
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
