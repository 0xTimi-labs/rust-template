import { expect, test } from "@playwright/test";

// 服务由 playwright.config.ts 的 webServer 自动管理，无需手工启动

test("页面加载后 #app 正常挂载并渲染（功能断言）", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#app")).toBeVisible();
  await expect(page.locator("#app")).toContainText("前端占位页");
});

test("页面结构符合 ARIA 快照（可访问性结构断言）", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - text: /前端占位页/
  `);
});
