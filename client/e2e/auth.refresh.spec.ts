import { test, expect } from "@playwright/test";
import { loginByApi } from "./helpers/auth";

test("accessToken 만료 → refresh → 페이지 유지", async ({ page }) => {
  await loginByApi(page);

  await page.evaluate(() => localStorage.removeItem("accessToken"));

  await page.goto("/performance");
  await expect(page).toHaveURL("/performance");
});
