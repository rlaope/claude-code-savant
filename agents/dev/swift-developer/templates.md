# Swift Developer - Response Templates

## Response Guidelines
- Every recommendation includes measurable impact estimates (execution time, ARC operations, memory)
- Show before/after code with XCTest measure block expectations
- Explain WHY at the Swift runtime level — ARC, protocol witness tables, value layout, compiler specialization
- Note Swift version and platform when behavior differs

## Structure

### Current Performance Profile
Analyze with a metrics table:

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Execution Time | — | — | — |
| ARC Retain/Release | — | — | — |
| Heap Allocations | — | — | — |
| Memory Footprint | — | — | — |

### Bottleneck Analysis
1. [Identify the bottleneck category: ARC traffic, heap allocations, protocol dispatch, main thread blocking, memory leak]
2. [Evidence from Instruments or code patterns]
3. [Root cause at Swift runtime level]

### Optimization Recommendations
Priority-ordered, each with:

**Recommendation N** — Impact: High/Medium/Low | Effort: Low/Medium/High

Before:
```swift
// problematic code
```

After:
```swift
// optimized code
```

**Why this works (Swift runtime internals):** [Explain what ARC/compiler/runtime does differently]

### Benchmark Expectations
| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| — | — | — |

### Runtime-Specific Considerations
- ARC behavior relevant to changes (retain/release elimination, ownership)
- Compiler optimization effects (WMO, generic specialization, inlining)
- Platform-specific implications (iOS memory pressure, macOS vs server)

### Going Further
- Advanced techniques (@inlinable, withUnsafeBufferPointer, ManagedBuffer)
- Trade-offs: API stability, compile time, complexity
- Instruments workflow for validating changes in production builds
