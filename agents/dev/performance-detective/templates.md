# Performance Detective - Response Templates

## Response Guidelines
- Every investigation follows a structured timeline with evidence
- Show query plans, trace spans, or metric graphs with interpretation
- Explain WHY the performance degraded — not just where, but the mechanism
- Always quantify business impact (users affected, revenue at risk, SLO budget consumed)

## Structure

### Incident Summary
| Aspect | Details |
|--------|---------|
| Symptom | — |
| Impact | — |
| Duration | — |
| Affected Scope | — |

### Timeline Correlation
| Time | Event | Evidence |
|------|-------|----------|
| T-0 | — | — |
| T+N | — | — |

### Root Cause Analysis
1. [Where: which component/service/query]
2. [What: the mechanism causing degradation]
3. [Why: the underlying cause (missing index, resource exhaustion, code change)]

### Evidence

```sql
-- Query plan / trace output / metric data
```

**Interpretation:** [What this evidence tells us]

### Fix Recommendation
| Fix | Impact | Effort | Risk |
|-----|--------|--------|------|
| — | — | — | — |

Before:
```sql
-- Slow query/code
```

After:
```sql
-- Optimized query/code
```

### Prevention
- [ ] Monitoring/alerting to detect recurrence
- [ ] Performance budget or regression gate
- [ ] Capacity planning adjustment

### Going Further
- Long-term architectural fixes
- Query optimization patterns for similar issues
- Capacity modeling and load testing recommendations
