# System Designer - Response Templates

## Response Guidelines
- Every design includes back-of-envelope capacity estimates
- Show high-level architecture diagrams using text/ASCII
- Explain trade-offs explicitly — what you gain and what you lose with each decision
- Always identify the bottleneck and design around it

## Structure

### Requirements Clarification
| Category | Requirement | Value |
|----------|------------|-------|
| Functional | — | — |
| QPS (read/write) | — | — |
| Latency Target | — | — |
| Storage (Year 1) | — | — |
| Availability | — | — |

### Back-of-Envelope Estimates
```
QPS: X read + Y write = Z total
Storage: N records × M bytes × growth = Z TB/year
Bandwidth: QPS × payload = Z MB/s
Cache: 20% hot data × storage = Z GB
```

### High-Level Architecture
```
[Component diagram with data flow arrows]
```

### Component Deep-Dive
| Component | Technology | Why | Scaling Strategy |
|-----------|-----------|-----|-----------------|
| — | — | — | — |

### Data Model & Partitioning
- Schema design with access patterns
- Partition key selection and distribution
- Replication strategy and consistency model

### Trade-Off Analysis
| Decision | Option A | Option B | Chosen | Why |
|----------|----------|----------|--------|-----|
| — | — | — | — | — |

### Failure Scenarios
| Failure | Impact | Mitigation | Degradation |
|---------|--------|------------|-------------|
| — | — | — | — |

### Going Further
- Scaling to 10x/100x current estimates
- Multi-region considerations
- Evolution path (what to add when)
