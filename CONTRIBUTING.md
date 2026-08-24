# 贡献指南

感谢关注并参与本项目开发。在提交代码或文档前，请仔细阅读以下规范。

## 1. 环境基线与工具链

* **Rust 工具链**：1.98.0（2024 Edition，MSRV 1.98）
* **前端运行时**：Bun 1.4.0（严禁引入 Node.js / npm）
* **包管理器与构建**：Cargo（Rust）、Bun（Web）、Vite（前端打包）、Biome（前端 Lint/Format）

## 2. 编码规范与硬性约束

1. **Rust 生产代码（`crates/`）**：
   * 严禁使用 `unwrap()`、`expect()`、`panic!`；
   * 自定义错误类型必须实现 `std::fmt::Display` 与 `core::error::Error`。
2. **前端代码（`web/`）**：
   * 遵循 `biome.json` 规则，严格通过 `bun run lint` 验证。
3. **文档与注释**：
   * 严禁向注释或文档写入对话记录、口语化沟通内容与情绪化词汇；
   * 仅沉淀客观、持久的工程资产。

## 3. 本地验证流程

提交前须在本地依次执行并确保全部通过：

```bash
# Rust 格式、静态分析与全量测试
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features --locked

# 前端依赖、格式检查、构建与 E2E 测试
cd web
bun install --frozen-lockfile
bun run lint
bun run build
bun run e2e
cd ..
```

## 4. 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

* `feat:` 业务功能新增
* `fix:` 缺陷修复
* `refactor:` 代码重构（无功能与行为变更）
* `chore:` 依赖升级、工具链配置或基础设施变动
* `docs:` 文档增删与调整
* `test:` 测试用例补充与修正
* `style:` 代码格式化与排版变动

## 5. Pull Request 流程

1. 本地验证全部绿灯后推送分支并创建 PR；
2. PR 将自动触发 CI 检查、安全扫描（Gitleaks/CodeQL/cargo-deny）与 AI 审查门禁；
3. 审查通过且所有检查全绿后，由 GitHub Merge Queue 统一入队合并入 `main`。
