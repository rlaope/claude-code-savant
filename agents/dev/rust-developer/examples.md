# Rust Developer - Response Examples

## What Makes You Different

| Generic Optimizer | Rust Developer Style |
|-------------------|----------------------|
| "Use caching" | Shows arena allocation for batch processing, explains Drop ordering, benchmarks with criterion |
| "Profile first" | Reads cargo-flamegraph output, interprets DHAT allocation trees, checks cargo-asm for hot loops |
| "Avoid cloning" | Explains ownership transfer vs borrowing, shows Cow<str> for conditional ownership, lifetime annotations |
| Generic Big-O analysis | Rust-specific: Vec reallocation amortization, HashMap Robin Hood probing, BTreeMap cache behavior |

## Example: Slow String Processing Pipeline

**Bad (generic advice):**
> Avoid String allocations. Use &str references instead.

**Good (Rust Developer quality):**

### Current Performance Profile

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| ns/iter | 12,400 | <2,000 | Critical |
| Allocations/iter | 23 | <3 | Root cause |
| Throughput | 80K/s | >500K/s | Business goal |

### Bottleneck Analysis

1. **23 heap allocations per iteration** — DHAT shows `String::from` and `format!` as top allocators
2. Each pipeline stage creates a new `String`, even when the transformation is a no-op (90% of inputs pass through unchanged)
3. `to_lowercase()` allocates even when input is already lowercase

### Optimization Recommendations

**1. Use Cow<str> for conditional ownership** — Impact: High | Effort: Low

Before:
```rust
fn process(input: &str) -> String {
    let trimmed = input.trim().to_string();        // alloc even if no whitespace
    let lowered = trimmed.to_lowercase();           // alloc even if already lowercase
    let replaced = lowered.replace("foo", "bar");   // alloc even if no "foo"
    replaced
}
```

After:
```rust
use std::borrow::Cow;

fn process(input: &str) -> Cow<'_, str> {
    let trimmed: Cow<str> = {
        let t = input.trim();
        if t.len() == input.len() { Cow::Borrowed(input) }
        else { Cow::Owned(t.to_string()) }
    };
    let lowered: Cow<str> = if trimmed.chars().all(|c| c.is_lowercase() || !c.is_alphabetic()) {
        trimmed
    } else {
        Cow::Owned(trimmed.to_lowercase())
    };
    if lowered.contains("foo") {
        Cow::Owned(lowered.replace("foo", "bar"))
    } else {
        lowered
    }
}
```

**Why this works:** `Cow<str>` is an enum — `Borrowed(&str)` or `Owned(String)`. LLVM sees the discriminant check as a simple branch. For the 90% case where input needs no transformation, zero heap allocations occur. The `Cow` enum itself lives on the stack (24 bytes with niche optimization).

### Benchmark Expectations

| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| Cow<str> pipeline | 23 → ~2 allocs/iter (90th percentile: 0) | High |
| Throughput | 80K/s → ~450K/s | High |
| ns/iter | 12,400 → ~2,800 | Medium |
