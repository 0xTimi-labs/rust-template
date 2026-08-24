use criterion::{Criterion, Throughput, criterion_group, criterion_main};
use oss_core::parse_setting;
use std::hint::black_box;

const INPUT: &str = "timeout = 30";

fn bench_parse(c: &mut Criterion) {
    let mut group = c.benchmark_group("parse_setting");
    group.throughput(Throughput::Bytes(INPUT.len() as u64));
    // 输入必须可解析，否则基准测的是错误路径：
    assert!(parse_setting(INPUT).is_ok(), "benchmark input must parse");
    group.bench_function("typical-line", |b| {
        b.iter(|| black_box(parse_setting(black_box(INPUT))))
    });
    group.finish();
}

criterion_group!(benches, bench_parse);
criterion_main!(benches);
