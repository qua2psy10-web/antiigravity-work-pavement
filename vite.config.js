import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 相対パスに指定してGitHub Pagesのパス解決エラー（白画面）を防止
  css: {
    postcss: {}
  }
})
