# Contributing Guidelines

Thank you for your interest in contributing to this project. Please review the following guidelines before submitting contributions.

## Prerequisites and Toolchain

* Rust: 1.98.0 (2024 Edition)
* Web Runtime: Bun 1.4.0 (Node.js and npm are strictly forbidden)
* Git: modern Git client with Conventional Commits support

## Development Workflow

1. Fork the repository and create a feature branch off `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Implement your changes adhering to the repository coding constraints:
   * Production Rust code (`crates/`) must strictly avoid `unwrap()`, `expect()`, and `panic!`.
   * Custom errors must implement `std::fmt::Display` and `core::error::Error`.
   * Web code must comply with `biome.json` rules.
3. Verify all checks locally prior to committing:
   ```bash
   # Rust formatting, linting, and testing
   cargo fmt --all --check
   cargo clippy --workspace --all-targets --all-features -- -D warnings
   cargo test --workspace --all-features --locked

   # Frontend verification
   cd web
   bun install --frozen-lockfile
   bun run lint
   bun run build
   bun run e2e
   cd ..
   ```

## Commit Message Guidelines

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` new user-facing features
* `fix:` bug fixes
* `refactor:` code restructuring without behavioral changes
* `chore:` dependency updates, build tooling, or infrastructure adjustments
* `docs:` documentation updates
* `test:` adding or improving tests
* `style:` formatting or lint fixes

## Pull Request Process

1. Ensure all local tests and linter checks pass before pushing.
2. Open a Pull Request against the `main` branch with a clear title and description.
3. Pull Requests trigger automated CI checks, security scans, and AI review gates.
4. Once all CI checks and reviews are approved, Pull Requests are integrated into `main` via the GitHub Merge Queue.
