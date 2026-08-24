//! 设置项解析。

use core::fmt;

/// 解析成功的设置项。
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Setting {
    /// 设置项名称（去除两侧空白）。
    pub name: String,
    /// 设置项数值。
    pub value: i64,
}

/// 解析 "名称=数值" 格式的配置行。
///
/// # Errors
/// 输入缺少 `=`、名称为空或数值不是合法 i64 时返回错误。
pub fn parse_setting(input: &str) -> Result<Setting, ParseError> {
    let (name, value) = input.split_once('=').ok_or(ParseError::MissingSeparator)?;
    let name = name.trim();
    if name.is_empty() {
        return Err(ParseError::EmptyName);
    }
    let value: i64 = value.trim().parse().map_err(|_| ParseError::InvalidValue)?;
    Ok(Setting {
        name: name.to_owned(),
        value,
    })
}

/// 解析失败的原因。
#[derive(Debug, Clone, PartialEq, Eq)]
#[non_exhaustive]
pub enum ParseError {
    /// 输入缺少 `=` 分隔符。
    MissingSeparator,
    /// 名称部分为空。
    EmptyName,
    /// 数值部分不是合法 i64。
    InvalidValue,
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingSeparator => write!(f, "missing `=` separator"),
            Self::EmptyName => write!(f, "setting name is empty"),
            Self::InvalidValue => write!(f, "value is not a valid i64"),
        }
    }
}

impl core::error::Error for ParseError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_input() {
        assert_eq!(
            parse_setting("timeout = 30"),
            Ok(Setting {
                name: "timeout".into(),
                value: 30
            })
        );
    }

    #[test]
    fn errors_on_missing_separator() {
        assert_eq!(
            parse_setting("timeout 30"),
            Err(ParseError::MissingSeparator)
        );
    }

    #[test]
    fn errors_on_empty_name() {
        assert_eq!(parse_setting("= 42"), Err(ParseError::EmptyName));
    }

    #[test]
    fn errors_on_invalid_value() {
        assert_eq!(
            parse_setting("timeout = abc"),
            Err(ParseError::InvalidValue)
        );
    }
}
