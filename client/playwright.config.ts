import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// 환경 변수 로드
dotenv.config({ path: ".env.test" });

export default defineConfig({
  use: {
    // 클라이언트 페이지 기본 URL
    baseURL: process.env.CLIENT_URL,
    viewport: { width: 1280, height: 720 },
    headless: false,
  },
});
