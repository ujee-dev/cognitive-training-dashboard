import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import fs from "fs"
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false, // true = 빌드 후 자동으로 브라우저에 분석 결과 창을 띄움
      filename: 'stats.html',
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // 별도 파일로 분리
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 용량 경고 기준 상향
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname,'./certs/key.pem')),   // 개인 키 경로
      cert: fs.readFileSync(path.resolve(__dirname,'./certs/cert.pem')) // 인증서 경로
    },
    host: 'localhost',
    strictPort: true, // 포트가 사용 중일 때 자동으로 다른 포트로 넘어가지 않게 설정
    port: 5173
  },
})
