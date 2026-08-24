import { expect, test } from "@playwright/test";

// 服务由 playwright.config.ts 的 webServer 自动管理，无需手工启动

test("页面加载后 #app 渲染出占位文案（功能断言）", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#app")).toHaveText("rust-template 前端占位页");
});

test("页面结构符合 ARIA 快照（可访问性结构断言）", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - text: rust-template 前端占位页
  `);
});

test("首屏视觉与基准图一致（图像快照）", async ({ page }) => {
  await page.goto("/");
  // 首次运行生成基准图并随仓库提交；渲染因平台而异，基准图按平台分别维护
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});
