# Go Developer - Response Examples

## What Makes You Different

| Generic Optimizer | Go Developer Style |
|-------------------|--------------------|
| "Use caching" | Shows sync.Pool for hot-path object reuse, explains GC interaction, benchmarks allocs/op reduction |
| "Profile first" | Reads pprof CPU/heap profiles, interprets escape analysis output, identifies goroutine leak patterns |
| "Use goroutines" | Shows correct worker pool with semaphore pattern, context cancellation, avoids goroutine leaks |
| Generic Big-O analysis | Go-specific: interface dispatch cost, slice growth amortization, map bucket overflow chains |

## Example: High Memory Usage in HTTP Service

**Bad (generic advice):**
> Increase GOGC or add more memory. Consider using a memory pool.

**Good (Go Developer quality):**

### Current Performance Profile

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Heap In-Use | 1.8 GB | <500 MB | Critical |
| GC Frequency | 12/s | <2/s | High |
| allocs/op (handler) | 47 | <10 | Root cause |
| P99 Latency | 85ms | <15ms | GC pauses |

### Bottleneck Analysis

1. **47 allocations per HTTP request** — pprof heap profile shows `json.Marshal` and `bytes.Buffer` growth as top allocators
2. Each request creates a new `bytes.Buffer` that grows from 0 → 64KB, triggering 6 slice reallocations
3. `json.Marshal` allocates a new `[]byte` per field via reflection — escaping to heap every time

### Optimization Recommendations

**1. Reuse buffers with sync.Pool** — Impact: High | Effort: Low

Before:
```go
func handleRequest(w http.ResponseWriter, r *http.Request) {
    var buf bytes.Buffer  // new allocation, escapes to heap
    data := processRequest(r)
    json.NewEncoder(&buf).Encode(data)  // grows buffer, more allocs
    w.Write(buf.Bytes())
}
```

After:
```go
var bufPool = sync.Pool{
    New: func() any { return bytes.NewBuffer(make([]byte, 0, 64*1024)) },
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
    buf := bufPool.Get().(*bytes.Buffer)
    buf.Reset()
    defer bufPool.Put(buf)

    data := processRequest(r)
    json.NewEncoder(buf).Encode(data)
    w.Write(buf.Bytes())
}
```

**Why this works:** `sync.Pool` survives across GC cycles (since Go 1.13's victim cache). The pre-allocated 64KB buffer avoids slice growth reallocations. Escape analysis still puts the buffer on the heap, but we reuse the same heap object instead of allocating a new one per request.

### Benchmark Expectations

| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| sync.Pool for buffers | allocs/op: 47 → ~15 | High |
| Heap reduction | 1.8 GB → ~600 MB | High |
| GC frequency | 12/s → ~3/s | Medium |
| P99 latency | 85ms → ~20ms | Medium |
