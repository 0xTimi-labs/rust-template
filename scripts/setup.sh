#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# rust-template 一键初始化脚本
# 用法: ./scripts/setup.sh <GitHub组织/用户名> <项目名> [项目描述]
# 示例: ./scripts/setup.sh my-org my-tool "我的高性能 Rust 工具"
# ==============================================================================

if [ "$#" -lt 2 ]; then
  echo "❌ 缺少必要参数！"
  echo "用法: $0 <GitHub组织/用户名> <项目名> [项目描述]"
  echo "示例: $0 my-org my-tool \"高性能 Rust 工具\""
  exit 1
fi

NEW_OWNER="$1"
NEW_NAME="$2"
NEW_DESC="${3:-A high-performance Rust project}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

echo "🚀 开始基于 rust-template 初始化新项目: ${NEW_OWNER}/${NEW_NAME}..."

# 1. 替换 Cargo.toml 中的仓库链接与包名
sedi "s|repository = \"https://github.com/0xTimi-labs/rust-template\"|repository = \"https://github.com/${NEW_OWNER}/${NEW_NAME}\"|g" "${ROOT_DIR}/Cargo.toml"

# 2. 替换 crates/cli/Cargo.toml
sedi "s|name = \"rust-template-cli\"|name = \"${NEW_NAME}-cli\"|g" "${ROOT_DIR}/crates/cli/Cargo.toml"
sedi "s|name = \"rust-template\"|name = \"${NEW_NAME}\"|g" "${ROOT_DIR}/crates/cli/Cargo.toml"

# 3. 替换 crates/cli 代码与测试
sedi "s|rust-template 命令行入口|${NEW_NAME} 命令行入口|g" "${ROOT_DIR}/crates/cli/src/main.rs"
sedi "s|Command::cargo_bin(\"rust-template\")|Command::cargo_bin(\"${NEW_NAME}\")|g" "${ROOT_DIR}/crates/cli/tests/cli.rs"

# 4. 替换 LICENSE 署名
sedi "s|Copyright (c) 2026 0xTimi-labs|Copyright (c) $(date +%Y) ${NEW_OWNER}|g" "${ROOT_DIR}/LICENSE"

# 5. 替换前端配置 (web/)
if [ -d "${ROOT_DIR}/web" ]; then
  sedi "s|\"name\": \"rust-template-web\"|\"name\": \"${NEW_NAME}-web\"|g" "${ROOT_DIR}/web/package.json"
  sedi "s|<title>rust-template</title>|<title>${NEW_NAME}</title>|g" "${ROOT_DIR}/web/index.html"
  sedi "s|rust-template 前端占位页|${NEW_NAME} 前端占位页|g" "${ROOT_DIR}/web/src/main.js"
  sedi "s|rust-template 前端占位页|${NEW_NAME} 前端占位页|g" "${ROOT_DIR}/web/e2e/app.spec.ts"
fi

# 6. 替换 README.md 标题与描述
sedi "s|# rust-template|# ${NEW_NAME}|g" "${ROOT_DIR}/README.md"

# 7. 刷新 lockfiles
echo "📦 正在刷新依赖 Lockfiles..."
(cd "${ROOT_DIR}" && cargo check --workspace --quiet)
if [ -d "${ROOT_DIR}/web" ] && command -v bun &>/dev/null; then
  (cd "${ROOT_DIR}/web" && bun install --quiet && bun run build --quiet)
fi

# 8. 自毁脚本自身
rm -f "${BASH_SOURCE[0]}"
rmdir "${ROOT_DIR}/scripts" 2>/dev/null || true

echo "✅ 项目初始化完成！"
echo "👉 后续步骤:"
echo "   1. 运行 'cargo test --workspace' 验证本地构建"
echo "   2. 按照 'docs/project-setup-guide.md' 配置 GitHub 仓库保护规则与 CI"
