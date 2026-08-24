import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // CI 中防止误提交 .only 导致只跑部分用例
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // CI 上缺失快照必须失败（防止回归被自动吞掉）；本地运行允许自动补基线
  updateSnapshots: process.env.CI ? "none" : "missing",
  // webServer 统一管理 preview 生命周期：CI 与本地（bun run e2e）行为完全一致，
  // 无需手工启动服务或编写轮询等待逻辑
  webServer: {
    command: "bunx --bun vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  expect: {
    toHaveScreenshot: {
      // 图像快照必须禁用动画与光标，否则像素级比对在 CI 上极不稳定
      animations: "disabled",
      caret: "hide",
    },
  },
});
