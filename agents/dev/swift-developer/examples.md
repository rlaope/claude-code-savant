# Swift Developer - Response Examples

## What Makes You Different

| Generic Optimizer | Swift Developer Style |
|-------------------|----------------------|
| "Use caching" | Shows NSCache vs Dictionary trade-offs, ARC cost of cache entries, memory pressure response |
| "Profile first" | Reads Instruments Time Profiler, identifies ARC traffic hotspots, interprets Allocations instrument |
| "Use structs" | Explains when class→struct helps (ARC elimination) vs hurts (large struct copying), shows COW pattern |
| Generic Big-O analysis | Swift-specific: Array COW trigger cost, protocol existential boxing, Dictionary rehashing with Hasher |

## Example: Laggy UITableView Scrolling

**Bad (generic advice):**
> Reuse cells and reduce the number of subviews. Use lighter images.

**Good (Swift Developer quality):**

### Current Performance Profile

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Frame Time | 24ms (drops to 14fps) | <16.6ms (60fps) | Critical |
| ARC Retain/Release | 4,200/frame | <500/frame | Root cause |
| Heap Allocations | 340/frame | <50/frame | Contributing |
| Main Thread Usage | 92% | <70% | Blocking |

### Bottleneck Analysis

1. **4,200 ARC operations per frame** — Instruments shows `swift_retain`/`swift_release` as 38% of frame time
2. Cell configuration creates `CellViewModel` class instances with 6 reference-type properties per cell
3. `DateFormatter` created per cell (expensive class initialization + ARC traffic)

### Optimization Recommendations

**1. Convert CellViewModel from class to struct** — Impact: High | Effort: Low

Before:
```swift
class CellViewModel {
    let title: String      // reference type — ARC managed
    let subtitle: String   // reference type — ARC managed
    let imageURL: URL      // reference type — ARC managed
    let date: String       // reference type — ARC managed
    let badge: BadgeInfo   // class — ARC managed
    let formatter: DateFormatter  // class — created per cell!
}

func configure(cell: Cell, model: CellViewModel) {
    cell.titleLabel.text = model.title     // retain model, retain title
    cell.subtitleLabel.text = model.subtitle
    cell.dateLabel.text = model.formatter.string(from: model.rawDate)
}
```

After:
```swift
struct CellViewModel {
    let title: String
    let subtitle: String
    let imageURL: URL
    let formattedDate: String   // pre-formatted, no DateFormatter per cell
    let badge: BadgeType        // enum instead of class
}

// Shared formatter — created once
private let dateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateStyle = .medium
    return f
}()

func configure(cell: Cell, model: CellViewModel) {
    cell.titleLabel.text = model.title     // no retain — struct is copied
    cell.subtitleLabel.text = model.subtitle
    cell.dateLabel.text = model.formattedDate
}
```

**Why this works:** Structs are value types — no ARC retain/release on access. The compiler places small structs in registers or on the stack. `String` inside a struct still uses ARC, but we eliminated the outer retain/release of the class container (6 operations per property access). Pre-formatting the date removes the per-cell `DateFormatter` allocation entirely.

### Benchmark Expectations

| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| class → struct ViewModel | ARC ops: 4,200 → ~800/frame | High |
| Shared DateFormatter | Allocations: 340 → ~80/frame | High |
| Frame time | 24ms → ~11ms (smooth 60fps) | High |
