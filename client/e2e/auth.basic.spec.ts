import { test, expect } from "@playwright/test";
import { loginByApi } from "./helpers/auth";

test.describe("기본 인증 흐름", () => {
  test("비로그인 → 보호된 페이지 접근 시 로그인 이동", async ({ page }) => {
    // 페이지 로드
    await page.goto("/performance");
    // URL 확인
    await expect(page).toHaveURL(/\/login/);
    // 화면 확인
    await expect(page.getByText("로그인하기")).toBeVisible();
  });

  test("로그인 성공 후 보호된 페이지 접근 가능", async ({ page }) => {
    await loginByApi(page);

    await page.goto("/performance");
    await expect(page).toHaveURL("/performance");
    await expect(page.getByRole('link', { name: '성과' })).toBeVisible();
  });
});
