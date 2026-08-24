# AI Agent 指南与项目上下文

本文件为接入本仓库的 AI Agent（如 Cursor、Claude Code、Antigravity、GitHub Copilot 等）提供结构化的项目上下文、架构拓扑与编码规则。

---

## 1. 架构拓扑

```text
rust-template/
├── crates/
│   ├── core/      # 核心逻辑库（纯业务与算法，零外部 I/O 耦合，零 unwrap）
│   └── cli/       # 命令行入口（参数解析、标准退出码、BrokenPipe 处理）
├── web/           # 前端界面（纯 Bun 运行时 + Vite + Biome + Playwright E2E）
└── .github/       # CI/CD 自动化（编排者模式、原生 Gitleaks、AI 审查门禁）
```

---

## 2. 核心技术栈与版本基线

* **Rust 工具链**：1.98.0（2024 Edition，MSRV 1.98）
* **前端运行时**：Bun 1.4.0（严禁引入 Node.js / npm）
* **包管理器与构建**：Cargo（Rust）、Bun（Web）、Vite（前端打包）、Biome（前端 Lint/Format）
* **测试框架**：内置 `cargo test`、`criterion`（基准测试）、`playwright`（E2E 断言与快照）

---

## 3. 编码规范与硬性约束（Negative Constraints）

1. **错误处理**：
   - 生产代码（`crates/`）**严禁使用 `unwrap()`、`expect()`、`panic!`**（全仓 Clippy 强制拒绝）；
   - 自定义错误类型必须实现 `std::fmt::Display` 与 `core::error::Error`。
2. **代码风格与规范**：
   - Rust：遵循默认 `cargo fmt` 与 strict `clippy` 规范；
   - Web：遵循 `biome.json` 规则，提交前通过 `bun run lint` 验证。
3. **文档与提交规范**：
   - 仓库内仅沉淀客观、持久的工程资产，**严禁向代码注释或文档写入对话记录、口语化沟通内容**；
   - 遵循 Conventional Commits 规范（`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`）。

---

## 4. 常用操作命令速查

```bash
# Rust 质量检查
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features --locked
cargo bench --workspace --no-run

# 前端开发与测试
cd web
bun install --frozen-lockfile
bun run lint
bun run build
bun run e2e
```
