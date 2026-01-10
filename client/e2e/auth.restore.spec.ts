import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("새로고침 후 로그인 유지", async ({ page }) => {
  await login(page);

  await page.reload();

  await expect(page.getByText("로그아웃")).toBeVisible();
});
