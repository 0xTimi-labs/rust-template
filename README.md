# rust-template

生产级 Rust 开源项目脚手架与全栈工程模板：跨平台 CLI、核心库与纯 Bun 前端，内置工业级 CI/CD、三重安全防御、AI 自动化代码审查与跨平台二进制发版流水线。

---

## 快速起步

### 方式一：GitHub 官方模板（推荐）
1. 点击仓库右上角 **【Use this template】→ 【Create a new repository】**；
2. 克隆新项目到本地后，运行一键初始化脚本（跨平台自动完成包名、仓库重命名并自毁）：
   ```bash
   python3 scripts/setup.py <你的GitHub组织/用户名> <你的新项目名> "<项目简要描述>"
   ```

### 方式二：直接克隆
```bash
git clone https://github.com/0xTimi-labs/rust-template.git my-project
cd my-project
python3 scripts/setup.py <你的GitHub组织/用户名> my-project "我的新项目"
```

---

## 流水线总览

| 工作流 | 触发时机 | 任务内容与职责 |
|---|---|---|
| **`ci.yml`** | PR / push main / merge_group / 每周一定时 | **CI 编排者**：并行调度 `checks.yml` 与 `security.yml`，具备 SHA 级精准防抖。 |
| **`checks.yml`** | 由 `ci.yml` 编排调用 | Rust 格式检查、严格 Clippy、三平台测试矩阵（Linux/macOS/Windows）、LLVM 覆盖率上报、纯 Bun 前端构建与 Playwright E2E。 |
| **`security.yml`** | 由 `ci.yml` 编排调用 | **原生 Gitleaks** 全量 Git 历史密钥扫描、**cargo-deny** 依赖安全与许可证合规、**CodeQL** 语义级漏洞分析。 |
| **`review-gate.yml`** | CI 首次成功后自动触发 | 校验 PR 状态与 head SHA，通过独立签名去重使用 GitHub App Token 调度 CodeRabbit 与 Greptile 进行双审。 |
| **`cache-cleanup.yml`** | PR 关闭 / 合并时触发 | 自动删除该 PR 独占的分支缓存与 AI 审查会话工件，防止 Actions 缓存与工件膨胀。 |
| **`ai-review.yml`** | 评论 `@timi-ai` / 手动触发 | 基于 Bun 运行时的 Timi AI 审查流水线，支持会话工件多轮上下文续接与 Fork 严格隔离。 |
| **`nightly.yml`** | 每周六 / 手动触发 | cargo-mutants 变异测试，验证测试用例本身的有效性。 |
| **`release.yml`** | 推送 tag（如 `v0.1.0`） | 基于 cargo-dist 自动交叉编译全平台二进制，产出安装器并发布 GitHub Releases。 |

---

## 本地开发常用命令

```bash
# Rust 质量检查
cargo test --workspace
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo fmt --all --check
cargo bench --workspace --no-run

# 前端构建与 E2E 测试
cd web
bun install --frozen-lockfile
bun run lint
bun run build
bun run e2e
```

---

## 仓库设置与上云清单

新项目创建后，请参考文档完成 3 分钟极速配置：
* [新项目搭建全流程指南](docs/project-setup-guide.md)：分支保护规则集、Merge Queue、AI 审查 App 配置与常见坑。
* [GitHub Actions 配置规范](docs/github-actions-setup-guide.md)：流水线架构规范、凭据管理与最佳实践。
* [贡献指南](CONTRIBUTING.md)：本地开发、环境基线、代码规范与提交指引。
* [安全策略](SECURITY.md)：支持版本矩阵与安全漏洞私密报告渠道。

---

## 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
