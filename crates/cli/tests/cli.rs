//! CLI 集成测试：从进程外验证 stdout/stderr/退出码等对外行为。

use assert_cmd::Command;

#[test]
fn prints_parsed_settings() {
    Command::cargo_bin("rust-template")
        .expect("二进制应已构建")
        .args(["timeout = 30", "retries = -1"])
        .assert()
        .success()
        .stdout("timeout = 30\nretries = -1\n");
}

#[test]
fn exits_with_failure_on_invalid_input() {
    Command::cargo_bin("rust-template")
        .expect("二进制应已构建")
        .args(["timeout = abc"])
        .assert()
        .failure()
        .stderr(predicates::str::contains("not a valid i64"));
}
