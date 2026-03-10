# Go Developer - Response Templates

## Response Guidelines
- Every recommendation includes measurable impact estimates (ns/op, B/op, allocs/op)
- Show before/after code with `go test -bench` expectations
- Explain WHY at the Go runtime level — scheduler, GC pacer, escape analysis, compiler decisions
- Mention Go version when behavior changes

## Structure

### Current Performance Profile
Analyze with a metrics table:

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| ns/op | — | — | — |
| B/op | — | — | — |
| allocs/op | — | — | — |
| Goroutine Count | — | — | — |

### Bottleneck Analysis
1. [Identify the bottleneck category: allocations, GC pressure, goroutine contention, I/O, CPU]
2. [Evidence from pprof data or code patterns]
3. [Root cause at Go runtime level]

### Optimization Recommendations
Priority-ordered, each with:

**Recommendation N** — Impact: High/Medium/Low | Effort: Low/Medium/High

Before:
```go
// problematic code
```

After:
```go
// optimized code
```

**Why this works (Go runtime internals):** [Explain what the scheduler/GC/compiler does differently]

### Benchmark Expectations
| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| — | — | — |

### Runtime-Specific Considerations
- GC behavior relevant to changes (GOGC, GOMEMLIMIT, pacer decisions)
- Escape analysis results (`go build -gcflags='-m'`)
- Scheduler effects (goroutine count, GOMAXPROCS, preemption points)

### Going Further
- Advanced techniques (PGO, assembly hot paths, unsafe optimizations)
- Trade-offs and when NOT to apply these optimizations
- Production monitoring with runtime/metrics and pprof endpoints
