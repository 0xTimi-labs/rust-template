# GitHub Actions 配置指南

本文档定义本模板从 CI 到 AI 审查、合并队列和发布的标准配置。标有 **【人工】** 的步骤须在 GitHub 设置页或本地终端执行，其余内容由仓库文件定义。

## 一、流水线架构

```text
PR 打开 / 更新
  ├─ checks.yml  格式、Clippy、三平台测试、覆盖率、E2E、前端构建
  ├─ security.yml gitleaks、cargo-deny、CodeQL
  │
  ├─ ci.yml（编排）并行调度上述两个 workflow
  │    └─ 全部通过即 CI 完成
  └─ CI 完成
       └─ review-gate.yml 仅在 pull_request 成功时处理
            ├─ 定位同仓或 fork PR
            ├─ 校验 PR 已 Ready 且 head.sha 未变化
            ├─ 按 PR 编号串行触发
            ├─ 已有自动命令评论则跳过
            └─ 首次成功发布两条命令评论

main 分支 push ──────── CI、安全扫描、CodeQL、性能基准
每周定时 ────────────── CodeQL 全量复查、变异测试
推送 tag v*.*.* ──────── release.yml 全平台编译与 GitHub Release
```

Review Gate 只为当前 PR 的首次成功 CI 发布命令评论。PR 后续提交由维护者手动评论触发审查。

## 二、仓库配置

### 1. 【人工】创建 main 骨架

```bash
git init -b main
printf '# 项目名\n' > README.md
git add README.md && git commit -m "chore: 初始化空项目"
gh repo create OWNER/REPO --public --source=. --push
```

### 2. 【人工】配置 Actions 凭据

| 名称 | 类型 | 用途 |
|---|---|---|
| `CODECOV_TOKEN` | Repository secret | 覆盖率上报鉴权凭据（受保护分支强制要求） |
| `AI_REVIEW_ENABLED` | Repository variable（可选） | pi 手动审查开关 |

Review Gate 使用仓库自动提供的短期 `github.token` 发布两条命令评论。Greptile 与 CodeRabbit 通过官方 App 接入仓库。工作流之间采用显式 Secret Mapping 传递凭据（遵循最小权限原则）。Gitleaks 采用官方 MIT 开源 CLI 原生执行，无需配置商业 License。

### 3. 【人工】将自动化文件同步到默认分支

`.github/workflows/*.yml`、`.coderabbit.yaml` 和 `greptile.json` 必须存在于默认分支才能按 GitHub 规则生效。建议先提交基础设施文件，再通过 PR 提交业务代码。

### 4. 【人工】安装审查 App

1. 安装 CodeRabbit：<https://github.com/apps/coderabbitai>。
2. 安装 Greptile：<https://github.com/apps/greptileai>，保持 `greptile.json` 的 `skipReview=AUTOMATIC`，并允许 `github-actions[bot]` 的命令评论触发审查。
3. `.coderabbit.yaml` 将 `auto_review.enabled` 与 `auto_incremental_review` 均设为 `false`。维护者后续可手动评论 `@coderabbitai review` 或 `@greptileai review`。

### 5. 【人工】配置分支保护与合并队列

Settings → Rulesets → 新建 ruleset（target: 默认分支）：

- 禁止 delete 和 non-fast-forward。
- 将实际 job 名称加入 required checks：`格式检查`、`Clippy`、`测试 (ubuntu-latest)`、`测试 (macos-latest)`、`测试 (windows-latest)`、`E2E 测试`、`前端构建`、`密钥泄露扫描`、`依赖检查`、`CodeQL 分析`。
- 合并队列采用 ALLGREEN 分组和 squash 合并；必要时可为 admin 临时添加 bypass，用后即撤。

## 三、首次自动审查契约

`review-gate.yml` 监听名称严格为 `CI` 的 `workflow_run` `completed` 事件，并在 job 条件中限制：

1. 事件类型为 `pull_request`。
2. CI conclusion 为 `success`。
3. 通过事件载荷、fork 来源仓库与分支或 commit 关联关系定位到唯一的 Ready PR。
4. PR 当前 head SHA 等于 `workflow_run.head_sha`。
5. PR 尚不存在 `github-actions[bot]` 发布的 `@coderabbitai review` 或 `@greptileai review`。

满足前四项且第五项成立时，Review Gate 按 PR 编号串行执行，并使用 `github.token` 发布两条评论。评论发布失败会使 Review Gate 失败。若仅成功发布一条，后续成功 CI 仍会跳过自动触发，维护者须根据失败日志手动补发缺失命令；这保证后续提交不会重新进入自动流程。

固定 action 版本：

- `actions/github-script@373c709c69115d41ff229c7e5df9f8788daa9553`（v9.0.0）

## 四、验证清单

```bash
actionlint .github/workflows/review-gate.yml
actionlint .github/workflows/*.yml
git diff --check
```

预期结果：Review Gate 单独 actionlint 通过；全部 workflow 可诊断，其中 `release.yml` 的既有告警须单独记录；差异无空白错误。

## 五、维护规则

- `workflow_run` 工作流只从默认分支版本生效；修改后须同步默认分支。
- 旧 head SHA、Draft PR、已关闭 PR、非 PR 成功运行均不触发审查；fork PR 通过来源仓库与分支反查后仍须通过 SHA 校验。
- CI 监听 `ready_for_review`，Draft 转为 Ready 后会重新验证当前提交。
- 自动审查只发生一次；同一 PR 的触发任务串行执行，后续提交由维护者阅读 CI 结果后手动评论。
- AI 审查是顾问，不替代分支保护、required checks 或合并队列。
- `release.yml` 的生成器升级须重新核对其既有安全加固内容，包括 SHA 锁定、权限和输入校验。
