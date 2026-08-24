//! 核心逻辑库：提供配置解析等基础能力。

mod settings;

pub use settings::parse_setting;
pub use settings::{ParseError, Setting};
