use clap::Parser;
use std::io::{self, Write};
use std::process::ExitCode;

/// rust-template 命令行入口。
#[derive(Parser)]
#[command(version, about)]
struct Args {
    /// 按 "名称=数值" 格式解析的配置行
    settings: Vec<String>,
}

fn main() -> ExitCode {
    let args = Args::parse();
    let mut stdout = io::stdout().lock();
    exit_code(run(&args, &mut stdout))
}

fn exit_code(result: io::Result<()>) -> ExitCode {
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(err) if err.kind() == io::ErrorKind::BrokenPipe => ExitCode::SUCCESS,
        Err(err) => {
            eprintln!("错误: {err}");
            ExitCode::FAILURE
        }
    }
}

fn run(args: &Args, stdout: &mut impl Write) -> io::Result<()> {
    for input in &args.settings {
        let setting = oss_core::parse_setting(input)
            .map_err(|err| io::Error::new(io::ErrorKind::InvalidData, err))?;
        writeln!(stdout, "{} = {}", setting.name, setting.value)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    struct BrokenPipeWriter;

    impl Write for BrokenPipeWriter {
        fn write(&mut self, _buf: &[u8]) -> io::Result<usize> {
            Err(io::Error::new(io::ErrorKind::BrokenPipe, "pipe closed"))
        }

        fn flush(&mut self) -> io::Result<()> {
            Ok(())
        }
    }

    #[test]
    fn exits_successfully_when_downstream_pipe_closes() {
        let args = Args {
            settings: vec!["a = 1".to_owned()],
        };

        assert_eq!(
            exit_code(run(&args, &mut BrokenPipeWriter)),
            ExitCode::SUCCESS
        );
    }
}
