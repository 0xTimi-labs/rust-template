#!/usr/bin/env python3
"""
rust-template 一键初始化脚本 (Python 3 标准库实现)
用法: python3 scripts/setup.py <GitHub组织/用户名> <项目名> [项目描述]
示例: python3 scripts/setup.py my-org my-tool "高性能 Rust 工具"
"""

import datetime
import os
import shutil
import subprocess
import sys
from pathlib import Path


def run_cmd(cmd: list[str], cwd: Path) -> bool:
    try:
        subprocess.run(cmd, cwd=cwd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def replace_in_file(file_path: Path, old: str, new: str) -> None:
    if not file_path.is_file():
        return
    content = file_path.read_text(encoding="utf-8")
    if old in content:
        file_path.write_text(content.replace(old, new), encoding="utf-8")


def main() -> None:
    if len(sys.argv) < 3:
        print("❌ 缺少必要参数！")
        print(f"用法: python3 {sys.argv[0]} <GitHub组织/用户名> <项目名> [项目描述]")
        print("示例: python3 scripts/setup.py my-org my-tool \"高性能 Rust 工具\"")
        sys.exit(1)

    new_owner = sys.argv[1].strip()
    new_name = sys.argv[2].strip()
    new_desc = sys.argv[3].strip() if len(sys.argv) > 3 else "A high-performance Rust project"
    current_year = str(datetime.datetime.now().year)

    root_dir = Path(__file__).resolve().parent.parent

    print(f"🚀 开始基于 rust-template 初始化新项目: {new_owner}/{new_name}...")

    # 1. 替换 Cargo.toml
    replace_in_file(
        root_dir / "Cargo.toml",
        'repository = "https://github.com/0xTimi-labs/rust-template"',
        f'repository = "https://github.com/{new_owner}/{new_name}"',
    )

    # 2. 替换 crates/cli/Cargo.toml
    replace_in_file(root_dir / "crates/cli/Cargo.toml", 'name = "rust-template-cli"', f'name = "{new_name}-cli"')
    replace_in_file(root_dir / "crates/cli/Cargo.toml", 'name = "rust-template"', f'name = "{new_name}"')

    # 3. 替换 crates/cli 代码与测试
    replace_in_file(
        root_dir / "crates/cli/src/main.rs",
        "rust-template 命令行入口",
        f"{new_name} 命令行入口",
    )
    replace_in_file(
        root_dir / "crates/cli/tests/cli.rs",
        'Command::cargo_bin("rust-template")',
        f'Command::cargo_bin("{new_name}")',
    )

    # 4. 替换 LICENSE 署名
    replace_in_file(
        root_dir / "LICENSE",
        "Copyright (c) 2026 0xTimi-labs",
        f"Copyright (c) {current_year} {new_owner}",
    )

    # 5. 替换前端配置 (web/)
    web_dir = root_dir / "web"
    if web_dir.is_dir():
        replace_in_file(web_dir / "package.json", '"name": "rust-template-web"', f'"name": "{new_name}-web"')
        replace_in_file(web_dir / "index.html", "<title>rust-template</title>", f"<title>{new_name}</title>")
        replace_in_file(web_dir / "src/main.js", "rust-template 前端占位页", f"{new_name} 前端占位页")

    # 6. 替换 README.md 标题
    replace_in_file(root_dir / "README.md", "# rust-template", f"# {new_name}")

    # 7. 刷新依赖 Lockfiles
    print("📦 正在刷新依赖 Lockfiles...")
    run_cmd(["cargo", "check", "--workspace"], cwd=root_dir)

    if web_dir.is_dir() and shutil.which("bun"):
        run_cmd(["bun", "install"], cwd=web_dir)
        run_cmd(["bun", "run", "build"], cwd=web_dir)

    # 8. 自毁脚本自身
    script_path = Path(__file__).resolve()
    script_dir = script_path.parent
    try:
        script_path.unlink(missing_ok=True)
        # 清理旧的 .sh 脚本（如有）
        sh_path = script_dir / "setup.sh"
        if sh_path.exists():
            sh_path.unlink()
        if script_dir.exists() and not any(script_dir.iterdir()):
            script_dir.rmdir()
    except OSError:
        pass

    print("✅ 项目初始化完成！")
    print("👉 后续步骤:")
    print("   1. 运行 'cargo test --workspace' 验证本地构建")
    print("   2. 按照 'docs/project-setup-guide.md' 配置 GitHub 仓库保护规则与 CI")


if __name__ == "__main__":
    main()
