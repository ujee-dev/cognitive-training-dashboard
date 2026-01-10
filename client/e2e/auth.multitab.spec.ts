import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("한 탭 로그아웃 → 다른 탭 동기화", async ({ browser }) => {
  const context = await browser.newContext();

  const pageA = await context.newPage();
  const pageB = await context.newPage();

  await login(pageA);
  await pageB.goto("/");

  // A에서 로그아웃
  await pageA.getByRole("button", { name: "로그아웃" }).click();

  // B도 자동 로그아웃
  await expect(pageB).toHaveURL("/");
  await expect(pageB.getByRole('link', { name: '로그인' })).toBeVisible();
});
