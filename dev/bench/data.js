window.BENCHMARK_DATA = {
  "lastUpdate": 1787592935581,
  "repoUrl": "https://github.com/0xTimi-labs/rust-template",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "d1e9c117e5c34be1903dbf8726486758f4f25b59",
          "message": "feat: 引入 Python 3 初始化脚手架与 AI 审查会话持久化 (#2)\n\n* feat: 引入 Python 3 跨平台初始化脚手架与 AI 审查 PR 会话持久化机制\n\n* ci: trigger checks",
          "timestamp": "2026-08-24T10:57:05Z",
          "tree_id": "b66557d4be0e56e6e035cdd6aa2f6b6d70c4f46e",
          "url": "https://github.com/0xTimi-labs/rust-template/commit/d1e9c117e5c34be1903dbf8726486758f4f25b59"
        },
        "date": 1787569179742,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 31,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "a9f45e0d62fa2a35e8eededd1c4ded42f44484a6",
          "message": "feat(ci): 独立门禁签名去重、Fork凭据隔离与依赖版本升级 (#10)\n\n* feat(ci): 接入 GitHub App 凭据并重构 AI 审查工作流\n\n* feat(ci): 接入 GitHub App 凭据并重构 AI 审查工作流\n\n* feat(ci): 接入 GitHub App 凭据并升级 CI 依赖版本\n\n重构 AI 审查工作流，接入 GitHub App 凭据，精简门禁触发逻辑并全量升级 Actions 依赖。\n\nCloses #6\n\n* feat(ci): 完善门禁签名去重、Fork隔离与依赖版本升级\n\n引入 HTML 隐藏签名实现门禁精准去重，增加 Fork PR 凭据隔离与输出截断兜底，全量升级 Actions 依赖版本。\n\nCloses #6\n\n* fix(ci): 兼容合并前受信任审查脚本回退恢复\n\n* fix(ai-review): 优化 Fork 仓库全名比对与入口参数校验\n\n* fix(ai-review): 仅在截断时输出完整日志并恢复受信任审查规范\n\n* fix(ai-review): 区分历史会话不存在与工件下载解压异常\n\n* feat(ci): 独立门禁签名去重、Fork凭据隔离与依赖版本升级\n\n为审查工具配置独立签名标记与分别判定，完善 Fork 隔离与会话异常处理，全量升级 GitHub Actions 依赖版本。\n\nCloses #6\n\n* feat(ci): 配置 App 凭据最小权限范围\n\n* feat(ai-review): 强化执行前 .pi 配置目录隔离清理\n\n* fix(ci): 严格执行受信任审查资源检出恢复\n\n* fix(ci): 在检出后立即物理清理不可信配置目录",
          "timestamp": "2026-08-24T15:58:15Z",
          "tree_id": "95ff8a492edfbeadc0abe9826961429a7c77fc91",
          "url": "https://github.com/0xTimi-labs/rust-template/commit/a9f45e0d62fa2a35e8eededd1c4ded42f44484a6"
        },
        "date": 1787587260331,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 31,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "a0be5d08dbe9702ad86a1a615aefc12fe4a5fec9",
          "message": "docs: 更新 CI 流水线、AI 审查门禁与凭据配置指南 (#11)\n\n* docs: 更新 CI 流水线、AI 审查门禁与凭据配置指南\n\n同步更新 GitHub Actions 架构、Review Gate 独立签名去重、GitHub App 凭据与 Actions 依赖版本基线。\n\n* fix(ci): 配置 App 凭据为 pull-requests write 权限",
          "timestamp": "2026-08-24T16:15:01Z",
          "tree_id": "fb5760fc9a1009b367e7939647887ac2225bc369",
          "url": "https://github.com/0xTimi-labs/rust-template/commit/a0be5d08dbe9702ad86a1a615aefc12fe4a5fec9"
        },
        "date": 1787588254139,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 32,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c6c42984f38ee6d023e21afd79c69fdbcf755bc5",
          "message": "chore(deps): 升级 CodeQL Action 至最新摘要并补充边界测试 (#13)\n\n* chore(deps): 升级 CodeQL Action 至最新摘要并补充零值边界测试\n\n升级 github/codeql-action 固定 SHA 摘要，补充 core 配置解析边界测试用例。\n\nCloses #6\n\n* style(core): 为测试用例结构体字面量添加尾随逗号",
          "timestamp": "2026-08-24T16:31:48Z",
          "tree_id": "978429568646b9e878c4dca8bd32cd6ce55bd2f7",
          "url": "https://github.com/0xTimi-labs/rust-template/commit/c6c42984f38ee6d023e21afd79c69fdbcf755bc5"
        },
        "date": 1787589262783,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 33,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "07f3d9b8653dda609bdd52930e2c75a840a0fc1c",
          "message": "chore(deps): 升级 Bun 运行时版本基线至 v1.4.0 (#14)\n\n升级前端与 AI 审查工作流中的 Bun 运行时至 v1.4.0，同步更新 AGENTS.md 版本基线规范。\n\nCloses #6",
          "timestamp": "2026-08-24T16:45:44Z",
          "tree_id": "f0edb039b2d716e2779302885dad816ae6f3df59",
          "url": "https://github.com/0xTimi-labs/rust-template/commit/07f3d9b8653dda609bdd52930e2c75a840a0fc1c"
        },
        "date": 1787590117644,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 30,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8270519f7ef485779278bb99ffc3abb2d4da9f03",
          "message": "docs: 补充开源社区健康规范与标准模板 (#15)\n\n* docs: 补充开源社区健康规范与标准模板\n\n添加 Contributor Covenant 行为准则、贡献指南、安全政策与结构化 Issue 表单模板。\n\n* docs: 规范化全量社区健康资产为中文并修复 E2E 预览超时\n\n* docs: 移除冗余的 AGENTS.md 并更新主页文档索引\n\n* docs: 简化缺陷报告表单并移除内部组件选择",
          "timestamp": "2026-08-24T17:33:04Z",
          "tree_id": "bfde7ecb82b086ff8758ed7863344227bc26fc6f",
          "url": "https://github.com/0xTimi-labs/rust-template/commit/8270519f7ef485779278bb99ffc3abb2d4da9f03"
        },
        "date": 1787592934816,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 33,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}