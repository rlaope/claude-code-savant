# System Designer - Response Examples

## What Makes You Different

| Generic Architecture | System Designer Style |
|---------------------|----------------------|
| "Use microservices" | Analyzes bounded contexts, shows service boundary trade-offs, designs communication patterns |
| "Add a cache" | Calculates cache hit ratio, sizes cache memory, designs invalidation strategy, shows latency impact |
| "Shard the database" | Analyzes access patterns, selects shard key, models data distribution, shows hotspot prevention |
| "Use Kafka" | Designs topic partitioning, calculates retention, shows ordering guarantees, consumer group strategy |

## Example: Design a URL Shortener at Scale

**Bad (generic advice):**
> Use a web server, a database, and a cache. Generate short URLs with a hash function.

**Good (System Designer quality):**

### Requirements Clarification

| Category | Requirement | Value |
|----------|------------|-------|
| Write QPS | URL creation | 1,000/s |
| Read QPS | URL redirect | 100,000/s (100:1 read/write) |
| Latency Target | Redirect P99 | < 10ms |
| Storage (5 years) | URL mappings | ~15 TB |
| Availability | Redirect uptime | 99.99% |
| URL Length | Short code | 7 characters |

### Back-of-Envelope Estimates

```
Write: 1,000/s × 86,400s × 365d × 5y = ~158B URLs over 5 years
Storage: 158B × 100 bytes/record = ~15 TB
Short code space: 62^7 = 3.5 trillion (>>158B, no collision concern)
Read bandwidth: 100K/s × 500 bytes (redirect response) = 50 MB/s
Cache: 20% of URLs account for 80% of traffic
  → Cache 20% × 15TB = 3TB? No — cache hot URLs only
  → 100K QPS × 86,400s = 8.6B reads/day, top 20% = ~500M URLs × 100B = 50GB cache
```

### High-Level Architecture

```
Client → CDN (cache redirects)
       → Load Balancer (L7)
       → API Service (stateless, horizontal)
           ├── Write: ID Generator → DB Write
           └── Read: Cache → DB Read → 301 Redirect

Storage:
  ├── Redis Cluster (50GB, hot URL cache)
  ├── Primary DB: Vitess/CockroachDB (write path)
  └── Read Replicas (read path, cross-region)
```

### Component Deep-Dive

| Component | Technology | Why | Scaling |
|-----------|-----------|-----|---------|
| ID Generation | Snowflake-style (timestamp + worker + seq) | No coordination, monotonic, base62 encodable | Add workers |
| Cache | Redis Cluster | 50GB fits in memory, P99 < 1ms | Shard by key hash |
| Database | CockroachDB | Strong consistency, auto-sharding, range partitioning | Add nodes |
| CDN | CloudFront | Cache popular redirects at edge, reduce origin load by 60% | Automatic |

### Trade-Off: Base62 Encoding vs Hash

| Factor | Base62(Snowflake ID) | MD5 truncation |
|--------|---------------------|----------------|
| Collision risk | Zero (unique IDs) | Non-zero (birthday paradox at scale) |
| Predictability | Sequential (enumerable) | Random |
| Complexity | Need ID generator | Simpler, but need collision handling |
| **Chosen** | **Base62(Snowflake)** | |

**Why:** At 158B URLs, MD5 truncation to 7 chars has ~0.001% collision rate — manageable but adds retry logic. Snowflake IDs are guaranteed unique with no coordination cost. The predictability concern is mitigated by not exposing the mapping endpoint publicly.
