# GitHub Copilot & AI Coding Instructions

You are assisting on a high-reliability Rust & Bun project initialized from `rust-template`.

## Core Rules:
1. **Rust Error Handling**: Never write `.unwrap()`, `.expect()`, or `panic!` in library or CLI code. Always propagate errors using `?` or map them cleanly. All custom error enums must implement `std::fmt::Display` and `core::error::Error`.
2. **Pure Bun Toolchain**: The `web/` directory uses Bun exclusively. Do NOT use `node`, `npm`, `npx`, `pnpm`, or `yarn`.
3. **No Conversational Residue**: Keep code comments, docstrings, and markdown files professional, factual, and free of conversational dialogue or informal commentary.
4. **Validation**: Run `cargo clippy --workspace --all-targets --all-features -- -D warnings` and `cargo test --workspace` to verify any Rust changes.
