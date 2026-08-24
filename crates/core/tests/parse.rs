//! 集成测试：从使用者视角验证公开 API。

use oss_core::{ParseError, Setting, parse_setting};

#[test]
fn tolerates_surrounding_whitespace() {
    assert_eq!(
        parse_setting("  key =  -1  "),
        Ok(Setting {
            name: "key".into(),
            value: -1
        })
    );
}

#[test]
fn error_types_are_comparable() {
    assert_ne!(ParseError::EmptyName, ParseError::InvalidValue);
}

#[test]
fn parse_setting_reports_documented_error_variants() {
    assert_eq!(parse_setting("key"), Err(ParseError::MissingSeparator));
    assert_eq!(parse_setting("= 1"), Err(ParseError::EmptyName));
    assert_eq!(parse_setting("key = abc"), Err(ParseError::InvalidValue));
}

#[test]
fn error_display_messages_are_explicit() {
    assert_eq!(
        ParseError::MissingSeparator.to_string(),
        "missing `=` separator"
    );
    assert_eq!(ParseError::EmptyName.to_string(), "setting name is empty");
    assert_eq!(
        ParseError::InvalidValue.to_string(),
        "value is not a valid i64"
    );
}

#[test]
fn handles_valid_positive_number() {
    assert_eq!(
        parse_setting("port = 8080"),
        Ok(Setting {
            name: "port".into(),
            value: 8080
        })
    );
}
