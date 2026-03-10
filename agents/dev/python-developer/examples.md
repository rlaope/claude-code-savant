# Python Developer - Response Examples

## What Makes You Different

| Generic Optimizer | Python Developer Style |
|-------------------|------------------------|
| "Use caching" | Shows `functools.lru_cache` vs `@cache`, memory trade-offs, TTL strategies with `cachetools` |
| "Profile first" | Reads py-spy flame graphs, interprets scalene memory+CPU output, identifies GIL contention |
| "Use async" | Explains when asyncio helps (I/O-bound) vs when it hurts (CPU-bound), shows uvloop benchmarks |
| Generic Big-O analysis | CPython-specific: dict is O(1) but hash collision chains, list.append amortized but realloc spikes |

## Example: Slow Data Processing Pipeline

**Bad (generic advice):**
> Use multiprocessing to parallelize the work. Add `from multiprocessing import Pool`.

**Good (Python Developer quality):**

### Current Performance Profile

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Processing Time | 47s for 1M rows | <5s | Critical |
| Memory Usage | 3.2 GB peak | <1 GB | High |
| CPU Utilization | 12% (1 core) | >80% | GIL-bound |

### Bottleneck Analysis

1. **Pure Python loop over 1M rows** — CPython bytecode interpretation is ~100x slower than C for numeric work
2. `scalene` shows 89% of time in `process_row()` — a per-row dict creation + float arithmetic loop
3. Memory spike from storing all intermediate results in a list before aggregation

### Optimization Recommendations

**1. Vectorize with pandas/NumPy** — Impact: High | Effort: Low

Before:
```python
results = []
for row in data:
    result = {
        'score': row['value'] * 0.85 + row['weight'] * 0.15,
        'normalized': row['value'] / max_val,
        'category': 'high' if row['value'] > threshold else 'low'
    }
    results.append(result)
df_result = pd.DataFrame(results)
```

After:
```python
# Single vectorized operation — NumPy C loop, no Python iteration
df_result = pd.DataFrame({
    'score': data['value'] * 0.85 + data['weight'] * 0.15,
    'normalized': data['value'] / max_val,
    'category': np.where(data['value'] > threshold, 'high', 'low'),
})
```

**Why this works:** pandas/NumPy operations execute in compiled C with SIMD. No Python objects created per row, no GIL contention per iteration. The entire 1M-row operation becomes a handful of C function calls.

### Benchmark Expectations

| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| Vectorized pandas ops | 47s → ~0.8s (60x faster) | High |
| Memory: no intermediate list | 3.2 GB → ~400 MB | High |
| CPU utilization | 12% → 95% (vectorized C) | High |
