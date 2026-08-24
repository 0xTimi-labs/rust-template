# 新项目搭建全流程指南

从空仓库到"CI 通过 → AI 审查 → 合并队列自动合并"的完整流水线搭建教程。每一步均可照做，含分支保护、merge queue、两家第三方 AI 审查 App 的申请与配置、发布链路与常见坑规避。

本指南以 Rust 开源项目为例（本模板仓库即按此搭建）；非 Rust 项目只需替换第 2、4 节中的构建命令，其余步骤通用。

## 1. 前置条件

| 项 | 说明 |
|---|---|
| GitHub 账号 | 仓库 Owner 权限（配置 ruleset、安装 App 需要） |
| gh CLI | 已 `gh auth login`；本文大部分操作可用网页完成，命令行方式给出 gh 替代 |
| Rust 工具链 | rustup，仓库内以 `rust-toolchain.toml` 固定版本（CI 与本地一致） |
| 本地门禁命令 | `cargo fmt --check`、`cargo test --workspace`、`cargo clippy --workspace --all-targets --all-features -- -D warnings` |

## 2. 初始化仓库

```bash
# 1) 本地初始化（默认分支必须叫 main）
git init -b main

# 2) 最小骨架
#    README.md / LICENSE / rust-toolchain.toml / Cargo.toml（workspace）
#    crates/core/（核心库）+ crates/cli/（二进制，可选）
#    .gitignore（含 target/、node_modules/、web/dist/）

# 3) 本地门禁全部通过后再推送（首次 push 是唯一一次"裸"提交）
cargo fmt --check && cargo test --workspace && cargo clippy --workspace --all-targets --all-features -- -D warnings

# 4) 创建远程仓库并推送
gh repo create OWNER/REPO --public --source=. --push
```

**注意**：第 2 步 push 之后、第 3 步保护生效之前存在无保护窗口——该窗口内**不要**存放任何凭据/密钥；一行一行的初始化内容（README/License/脚手架）最多。

## 3. main 分支保护（Ruleset）

位置：仓库 Settings → Rulesets → New ruleset。以下逐条配置（本模板的实测参数）：

### 3.1 基本信息

| 项 | 值 |
|---|---|
| Name | `main 分支保护` |
| Enforcement status | Active |
| Targets | 默认分支（新仓库默认分支即 main，之后改默认分支名需同步此设置） |

### 3.2 规则清单（本模板实测值）

**① Delete branch**：禁止删除受保护分支。

**② Block force pushes**：禁止强制推送（non-fast-forward）。

**③ Require a pull request before merging**

| 参数 | 值 | 说明 |
|---|---|---|
| Required approvals | 0 | AI 审查是顾问门禁，不设人工审批门槛（需要人工审批则填 1+） |
| Require PR before merging | 开 | 所有 main 变更必须来自 PR |
| Allowed merge methods | Squash only | 与 merge queue 的合并方式保持一致 |
| Dismiss stale reviews on push | 开 | 新提交后旧审批自动失效 |
| Require conversation resolution | 关 | 社交对话不阻塞合并 |

**④ Require status checks to pass**（核心）

- **前提**：必须先有 workflow 并至少成功运行过一次——check 名下拉列表才存在。首次配置建议先推一个纯 CI 基础设施 PR（见第 4 节），跑绿后再回来勾选。
- **Required checks 列表**（与 workflow job 名**逐字一致**，含嵌套前缀）：

```
checks / 格式检查
checks / Clippy
checks / 测试 (ubuntu-latest)
checks / 测试 (macos-latest)
checks / 测试 (windows-latest)
checks / 前端构建
checks / E2E 测试
security / 密钥泄露扫描
security / 依赖检查
security / CodeQL 分析
```

嵌套前缀规则（`checks / xxx`、`security / xxx`）：required check 名取**调用方 workflow 的 job 名**——编排者 `ci.yml` 中以 `checks`、`security` 为 job 名调用 `workflow_call`，被调用 workflow 内的 job 名（如"格式检查"）拼成 `checks / 格式检查`。独立 workflow（不经编排调用）则直接用 job 名，无前缀。

- **Strict status checking**：开（要求 check 针对最新提交；合并队列内由 merge_group 提交重跑保证）。

**⑤ Merge queue**

| 参数 | 值 | 说明 |
|---|---|---|
| Grouping strategy | ALLGREEN | 整组全绿才合并；任一失败则整组弹出 |
| Min entries to merge | 1 | 单 PR 也允许合并（等待窗口到期后即合） |
| Min entries to merge wait | 5 分钟 | 打包窗口：等更多 PR 入组 |
| Max entries | 5 | 每批最多 5 个 PR |
| Merge method | Squash | |
| Check response timeout | 60 分钟 | 队列等待 checks 超时后判失败 |

### 3.3 bypass actors：必须清空（最常踩的坑）

新 ruleset 的 bypass actors 默认包含 `RepositoryRole > Admin`（always）——这意味着维护者/管理员直推、直合、绕过全部规则，merge queue 全程不生效。**创建后立即清空 bypass actors**，并确认：

```bash
gh api repos/OWNER/REPO/rulesets/ID --jq '.bypass_actors'   # 必须为空数组 []
```

### 3.4 验证

```bash
# 直推 main 必须被拒绝
git checkout main && echo test >> README.md && git push origin main
# → remote: error: GH006: Protected branch ... 拒绝
```

## 4. CI/CD 三文件架构

GitHub 没有"等待另一个 workflow 完成"的原生原语；官方推荐 **单一编排者 + workflow_call 复用**。

```text
.github/workflows/
├── ci.yml           # 编排者（name: CI）：只做并行调度，不写逻辑
├── checks.yml       # 可复用：格式、Clippy、测试矩阵、覆盖率、前端构建、E2E、基准
└── security.yml     # 可复用：gitleaks、cargo-deny、CodeQL
```

**ci.yml 骨架**（触发事件与权限）：

```yaml
name: CI

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
  push:
    branches: [main]
  merge_group:        # merge queue 启用后必须监听，否则 required checks 卡死
  schedule:
    - cron: "30 23 * * 0"   # UTC 周日 23:30 ≈ 北京周一 07:30

permissions:
  contents: read

concurrency:
  group: ci-${{ github.event.pull_request.head.sha || github.event.merge_group.head_sha || github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    permissions:
      contents: write    # bench 需要写 gh-pages 分支
    uses: ./.github/workflows/checks.yml
    secrets:
      CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
  security:
    permissions:
      contents: read
      security-events: write   # CodeQL 上传 SARIF
    uses: ./.github/workflows/security.yml
```

要点：

- **concurrency 键用 head_sha 而非 PR 号**：Webhook 投递顺序不保证，按 PR 号分组会让旧 SHA 的迟到事件取消新 run（github/docs 官方实践）。
- **显式 Secret 映射**：遵循最小权限原则，仅向被调用工作流传递必需的凭据（向 `checks` 传递 `CODECOV_TOKEN`），避免全量继承导致权限外溢。
- 权限最小化：每个 job 只给所需权限。
- 本地校验：`actionlint .github/workflows/*.yml`。

## 5. 检查集价值分层（merge queue 的配合设计）

merge queue 的 merge_group 提交会重跑全部 required checks。检查按"组合验证价值"分三层，避免无意义重复：

| 层 | 定义 | 检查 | merge_group 行为 |
|---|---|---|---|
| ① 组合正确性 | 结果受"多个 PR 组合"影响 | 测试、格式、Clippy、前端构建、E2E、依赖检查 | ✅ 全跑 |
| ② 内容原子 | 检查对象是"单个变更的内容"，组合不产生新信息 | 密钥泄露扫描、CodeQL | ⏭ 跳过（job 级 `if: github.event_name != 'merge_group'`，check 以 skipped 出现） |
| ③ 趋势/信息 | 历史记录或信息展示，不是合并门禁 | 覆盖率、性能基准 | ⏭ 不跑（覆盖率同样 if 排除；bench 仅在 push main 时跑） |

实现要点：

- ②的检查**不能**通过"workflow 不监听 merge_group"来回避——required check 必须在 merge_group 运行中**出现**（skipped 也接受），否则队列永远等待、直接卡死。正确写法是 job 级 if，让 check 以 skipped 状态出现。
- ②跳过后的兜底：合并产生 push main → main 上的 CI 全量执行密钥扫描与 CodeQL（内容在进入 main 时被最终审核；组合提交只是各 PR 内容之和，PR 阶段已逐份扫描过，无缺口）。
- ①的 job 不需要任何条件——它们天然就是 merge_group 的重跑集合。

```yaml
# security.yml 示例（②内容原子）
jobs:
  gitleaks:
    name: 密钥泄露扫描
    if: github.event_name != 'merge_group'
    # ...
  codeql:
    name: CodeQL 分析
    if: github.event_name != 'merge_group' && (github.event_name != 'pull_request' || github.event.pull_request.head.repo.fork == false)
    # ...
```

## 6. 第三方 AI Reviewer：申请与配置

### 6.1 CodeRabbit

**申请与安装**：

1. 打开 <https://github.com/apps/coderabbitai> → **Install**。
2. 选择安装范围：All repositories（推荐，省心）或 Only select repositories。
3. 开源仓库免费；安装后可跳过 CoPilot 订阅引导（可选）。首次安装后 CodeRabbit 会在新 PR 上自动尝试审查——本模板通过 `.coderabbit.yaml` 关闭自动功能，改为命令触发。
4. 安装完成后在 Settings → Applications → GitHub Apps 中确认 CodeRabbit 已对目标仓库生效。

**仓库配置 `.coderabbit.yaml`**（只写非默认值；配置文档：<https://docs.coderabbit.ai/reference/configuration>）：

```yaml
language: zh-CN                 # 审查评论语言
reviews:
  review_status: false          # 关闭"审查跳过/无法进行"状态评论
  review_progress: false        # 关闭进度/状态评论
  commit_status: false          # 关闭 PR checks 上的审查状态（仅 review_progress 关闭时生效）
  enable_prompt_for_ai_agents: false  # 评论不含 AI Agent 提示段
  in_progress_fortune: false    # 审查中不发占位消息
  auto_review:
    enabled: false              # 关闭自动审查（改由命令触发）
    auto_incremental_review: false
  profile: quiet                # 安静档：只报最重要发现
  collapse_walkthrough: false   # 摘要/走查默认展开
  path_filters:
    - "!web/dist/**"            # 构建产物不审
```

**触发方式**：在 PR 评论 `@coderabbitai review`；配合 Review Gate（第 7 节）在首次 CI 成功时自动发布。

### 6.2 Greptile

**申请与安装**：

1. 打开 <https://github.com/apps/greptileai> → **Install**，选择目标仓库。
2. 首次安装会引导登录/注册 Greptile 账号并绑定 GitHub App（免费额度）；按引导完成账号绑定。
3. 若希望 GitHub Actions 的命令评论能触发审查，在 Greptile 的设置中确认仓库级 `skipReview` 配置（见下）且允许命令触发。

**仓库配置 `greptile.json`**：

```json
{
  "instructions": "审查评论使用简体中文……（项目自定义审查规范）",
  "skipReview": "AUTOMATIC"
}
```

- `skipReview: AUTOMATIC`：不自动审查，等待命令评论触发（与 CodeRabbit 的 auto_review 关闭等价）。
- 仓库级 `REVIEW_GUIDELINES.md` 声明 P0/P1/P2 分级与审查重点，作为两家 App 的审查规范输入。

**触发方式**：PR 评论 `@greptileai review`。

### 6.3 Codecov（测试覆盖率上报）

**配置与接入**：

1. 访问 <https://app.codecov.io> 使用 GitHub 账号登录。
2. 授权组织或个人账户，并访问目标仓库（例如 `https://app.codecov.io/gh/ORGANIZATION/REPO`）。
3. 在仓库设置页面获取 Upload Token。
4. 将 Token 存入 GitHub 仓库 Actions Secret：
   ```bash
   gh secret set CODECOV_TOKEN
   ```
5. **覆盖率策略与可观察性**：
   - 根目录配置文件 [`codecov.yml`](../codecov.yml) 采用 `informational: true` 策略（作为可观察性指标，不阻断合并队列）。
   - CI 并发执行 `cargo-llvm-cov` 测量代码行覆盖率，并向 Codecov 提交数据生成 `codecov/patch` 状态。
   - Codecov 产出代码覆盖率 Diff 报告与状态标记，供维护者与评审者评估测试质量。

### 6.4 验证

开第一个功能 PR（或测试 PR），CI 全绿后观察 Review Gate 是否发布两条命令评论；两家 App 是否在稍后出审查结果。首次配置若命令评论无响应，检查：

- App 是否安装在**组织**级别与仓库级别（若仓库属于组织，某些 App 需要先在组织市场安装）。
- App 的仓库权限（Contents: read、Pull requests: read/write、Checks: read）是否完整。

## 7. 审查触发契约（Review Gate）

`review-gate.yml` 实现"首次 CI 成功自动触发、后续提交手动触发"的契约：

```text
PR 提交 → CI（ci.yml 编排）全部通过
  → review-gate.yml（workflow_run 监听名称严格为 CI 的 completed 事件）
       ├─ 仅处理 pull_request 且 conclusion=success
       ├─ 定位对应 PR（fork 用来源仓库+分支反查）
       ├─ 校验 PR 已 Ready 且当前 head.sha 与运行 head_sha 一致
       ├─ 未存在自动命令评论 → 发布 @coderabbitai review / @greptileai review
       └─ 后续提交：命令已存在 → 跳过；由维护者手动评论触发复审
```

**维护约定**：

- `workflow_run` 类 workflow 只从**默认分支上的版本**生效——修改 review-gate.yml 必须先合入默认分支。
- 首次触发若只成功发布一条命令，需根据失败日志手动补发另一条（此后自动流程不再重发）。
- AI 审查是顾问，不是合并门禁；确定性门禁仍由 ruleset 的 required checks 与 merge queue 负责。

## 8. 何时 push main

**main 的唯一变更来源是 merge queue 的自动合并**（ruleset 已禁止直推，且 bypass actors 已清空）。合法操作只有三类：

| 操作 | 路径 | 说明 |
|---|---|---|
| 功能/修复/文档变更 | 功能分支 → PR → CI 全绿 → `gh pr merge --squash`（入队）→ merge_group 验证 → 自动合并 | 所有日常变更的唯一路径 |
| 发布 | `git tag v0.1.0 && git push origin v0.1.0` | 推 tag 不是推 main；tag 触发 release.yml |
| fork 贡献 | fork 分支 PR（不推远程 main 分支） | 与内部 PR 同等待遇，可入队 |

**禁止**：`git push origin main`（被 ruleset 拒绝）、临时 bypass 直合（反模式）、在 merge queue 中对队列内 PR 分支 push（会报错——先 `gh pr merge --disable-auto` 出队再改）。

紧急修复同样走 PR → 队列；队列最短等待 5 分钟（单 PR 打包窗口），这是可接受的延迟，也是每笔合并都带组合验证的代价。

## 9. 依赖更新（Renovate，可选）

1. 安装 App：<https://github.com/apps/renovate> → Configure → 选择仓库 → **Renovate Only + Scan and Alert**（onboarding 完成后按仓库 `renovate.json` 运行）。
2. 仓库配置（示例）：

```json
{
  "extends": ["config:recommended", ":semanticCommits"],
  "timezone": "Asia/Shanghai",
  "schedule": ["after 6am and before 7am on monday"],
  "labels": ["dependencies"],
  "dependencyDashboard": true,
  "packageRules": [
    { "matchUpdateTypes": ["minor", "patch", "lockFileMaintenance"], "groupName": "all non-major ({{manager}})", "automerge": true },
    { "matchUpdateTypes": ["digest"], "groupName": "all digests ({{manager}})" },
    { "matchManagers": ["github-actions"], "matchUpdateTypes": ["major"] }
  ]
}
```

- minor/patch/lockFile 按生态分组并 automerge（自动合并的 PR 同样走 merge queue）。
- digest（更新可能改变 CI 执行代码）与 GitHub Action 主版本升级保留人工审查。
- `dependencyDashboard` 提供依赖总览与手动重跑入口。

## 10. 发布链路（cargo-dist + tag）

1. `cargo dist init`（或使用模板自带的 `release.yml`，由 cargo-dist 生成后叠加安全加固：SHA 锁定 action 版本、最小权限、输入校验）。**Cargo.toml 必须存在 `[profile.dist]`**（`inherits = "release"`）——cargo-dist 的 dist build 基于它，缺失时构建阶段以 exit 255 失败且无产物产出。
2. 发布 `git tag v0.1.0 && git push origin v0.1.0`。**tag 必须与 `workspace.package.version` 完全一致**（cargo-dist 校验）；预发布版本需先将包版本改为带后缀（如 `0.1.0-beta.1`）再打同名 tag。
3. tag 推送触发 release.yml：全平台（Linux/macOS/Windows）编译产物、安装器与 checksums 上传 GitHub Release。
4. 核对产物清单与 checksum 后发布（draft 转正式，或按项目习惯保留 draft）。

**预发布建议**：首个验证 tag 与包版本同为 `0.1.0`；正式预发布按上述规则改包版本后重打。

## 11. 定时任务时间表

| 任务 | 北京时 | cron（UTC） | 设计原则 |
|---|---|---|---|
| 全量安全扫描（CodeQL/gitleaks/deny 周扫存量） | 周一 07:30 | `30 23 * * 0` | 上班前出结果；避开整点全球高峰 |
| 依赖扫描（Renovate） | 周一 06:30-07:00 | schedule 字段（时区 Asia/Shanghai） | PR 上班前出现 |
| 变异测试（cargo-mutants） | 周六 09:30 | `30 1 * * 6` | 长任务放周末；周一上班前结果可查 |

**注意**：GitHub Actions 的 cron 一律按 UTC 解释；配置文件中写 UTC，换算北京时间 = UTC + 8。

## 12. 常见坑与规避

| # | 现象 | 根因 | 规避 |
|---|---|---|---|
| 1 | merge queue 从不生效，直合直推畅通 | ruleset bypass actors 未清（默认含 Admin always） | 创建后立即清空；`gh api ... .bypass_actors` 验证为空 |
| 2 | 入队后 checks 永远 pending，队列超时 | required check 名与 job 名不一致，或 workflow 未监听 `merge_group` | 名称逐字一致（含嵌套前缀）；编排者必须监听 merge_group |
| 3 | `unknown command " dir"` | YAML plain scalar 反斜杠续行产生前导空格 | 多行命令用 `run: \|` 字面块或单行，禁止 plain scalar + `\` |
| 4 | gitleaks 在 merge_group 产生多余重跑 | 组合提交不产生新密钥，无需重复扫描 | merge_group 跳过（skipped）+ push main 兜底 |
| 5 | CodeQL 在 merge_group 报 ref 错误 | gh-readonly-queue 临时 ref 无法上传 SARIF | merge_group 跳过；合并后 push main 全量上传 |
| 6 | 连续 push 后新 run 被旧事件取消 | concurrency 键用 PR 号，旧 SHA 迟到事件命中同组 | 键改用 `head.sha \|\| merge_group.head_sha` |
| 7 | review-gate 改了不生效 | `workflow_run` 只认默认分支版本 | 先合入默认分支再观察 |
| 8 | fork PR 无法读取仓库密钥 | fork 事件出于安全策略只有只读 token，无 secrets | Gitleaks 采用官方 MIT 开源 CLI 原生执行，无需 License；CodeQL 跳过 |
| 9 | 定时任务时间与预期差 8 小时 | cron 按 UTC 解释 | 换算北京时间；文档写 UTC 并标注换算 |
| 10 | 队列内 push 报 422 | merge queue 中分支被锁定 | `gh pr merge --disable-auto` 出队，改完重新入队 |
| 11 | bench job 失败（无分支/缓存损坏） | 首次无 gh-pages 基线；rust-cache 会缓存 criterion 的损坏 sample.json | 先创建 gh-pages 分支；bench job 不使用 rust-cache |
| 12 | 覆盖率上报失败（提示 Token required） | Codecov 在受保护分支强制要求 Token 鉴权，或可复用工作流未传递 Secret | 在 GitHub 仓库配置 `CODECOV_TOKEN`；`ci.yml` 显式向 `checks.yml` 传递该 Secret |
| 13 | ruleset 对"默认分支"描述与实际不符 | Target 固定为分支名而非"default"语义 | 显式确认目标分支；改默认分支名后同步 |

## 13. 上线验证清单

按序执行，全部通过即流水线就绪：

- [ ] 本地：`cargo fmt --check && cargo test --workspace && cargo clippy --workspace --all-targets --all-features -- -D warnings` 通过
- [ ] `actionlint .github/workflows/*.yml` 无错误
- [ ] ruleset：bypass actors 为空；required checks 10 项与 job 名一致；merge queue 参数已设
- [ ] **直推 main 被拒绝**（实测）
- [ ] 基础设施 PR：CI 在 pull_request 与 merge_group 上均成功（注意 merge_group 运行中 gitleaks/CodeQL/覆盖率以 skipped 出现属预期）
- [ ] 首个功能 PR：CI 全绿 → Review Gate 自动发布两条命令评论 → 两家 App 各出审查
- [ ] 该 PR 入队后自动合并（ALLGREEN 单 PR 组）
- [ ] 合并后 push main 运行成功（CodeQL 上传 SARIF、bench 写 gh-pages、gitleaks 官方 action 全量扫描）
- [ ] 定时任务时间戳正确（参考第 11 节表格）
- [ ] 本地 `git log` 提交历史无直推记录（全部走 PR + squashed merge）

> 模板仓库如需复用：克隆后替换 crate 名与 `org/repo` 引用，按本指南第 3、6、9 节重新执行人工步骤。
