import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("refresh 실패 → 세션 만료 → 로그인 이동", async ({ page }) => {
  await login(page);

  // refresh 실패 상황 유도
  await page.evaluate(() => {
    localStorage.setItem("accessToken", "INVALID_TOKEN");
  });

  await page.goto("/performance");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("로그인하기")).toBeVisible();
});
