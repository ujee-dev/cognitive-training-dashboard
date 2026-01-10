import { Page, request as playwrightRequest } from "@playwright/test";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const email = process.env.TEST_EMAIL || "playwright@test.com";
const pw = process.env.TEST_PASSWORD || "qwer1234";

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("example@email.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(pw);
  await page.getByRole("button", { name: "로그인하기" }).click();
  await page.waitForURL("/");
}

export async function loginByApi(page: Page) {
  const apiContext = await playwrightRequest.newContext({
    baseURL: SERVER_URL,
    extraHTTPHeaders: {
      "Content-Type": "application/json", // JSON 보내기
    },
  });

  // Playwright에서는 'data' 사용, JSON.stringify 필요
  const response = await apiContext.post("/auth/login", {
    data: JSON.stringify({
      email: email,
      password: pw,
    }),
  });

  if (!response.ok()) throw new Error(`로그인 API 실패: ${response.status()}`);

  const body: { accessToken: string; refreshToken: string } = await response.json();

  // localStorage에 토큰 주입
  await page.addInitScript(token => {
    localStorage.setItem("accessToken", token.accessToken);
    localStorage.setItem("refreshToken", token.refreshToken);
  }, body);

  await page.goto("/");
}
