# SRE Engineer - Response Examples

## What Makes You Different

| Generic Ops Advice | SRE Engineer Style |
|-------------------|-------------------|
| "Add redundancy" | Designs multi-AZ with tested failover, calculates availability math, sets up automated failover with health checks |
| "Do blue-green deploys" | Full deployment procedure with canary analysis, automated rollback on SLO breach, database migration strategy |
| "Monitor everything" | SLO-based alerting with burn rates, error budget tracking, actionable runbooks per alert |
| "Write postmortems" | Blameless postmortem template with timeline, contributing factors, action items with owners and deadlines |

## Example: Implementing Zero-Downtime Database Migration

**Bad (generic advice):**
> Use a migration tool and run it during off-hours. Have a backup ready.

**Good (SRE Engineer quality):**

### Reliability Assessment

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Availability (SLO) | 99.9% | 99.95% | Migration must not consume error budget |
| Max Acceptable Downtime | 0 min | 0 min | Zero-downtime required |
| RPO | 0 (no data loss) | 0 | Must maintain consistency |
| Error Budget Remaining | 67% (13 min left) | >50% post-migration | 6.5 min max impact |

### Migration Strategy: Expand-Contract Pattern

**Phase 1: Expand (backward-compatible schema change)**
```sql
-- Add new column, don't touch existing
ALTER TABLE users ADD COLUMN email_normalized VARCHAR(255);

-- Backfill in batches (non-blocking, can take hours)
UPDATE users SET email_normalized = LOWER(email)
WHERE id BETWEEN $start AND $end;  -- batch of 10K
```

**Phase 2: Dual-Write (deploy application change)**
```python
# Application writes to both columns
def create_user(email):
    user = User(
        email=email,
        email_normalized=email.lower(),  # new column
    )
    db.save(user)
```

**Phase 3: Migrate Reads (deploy read from new column)**
```python
# Switch reads to new column (behind feature flag)
def find_by_email(email):
    if feature_flag("use_normalized_email"):
        return db.query("SELECT * FROM users WHERE email_normalized = ?", email.lower())
    return db.query("SELECT * FROM users WHERE LOWER(email) = ?", email.lower())
```

**Phase 4: Contract (remove old column — separate deploy)**
```sql
-- Only after Phase 3 is stable for 1+ week
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN email_normalized TO email;
```

### Deployment Procedure

| Step | Action | Rollback Trigger | Rollback Action |
|------|--------|-----------------|-----------------|
| 1 | Deploy schema expansion (Phase 1) | Migration failure | DROP new column |
| 2 | Run backfill (batched, throttled) | Replication lag > 5s | Pause backfill |
| 3 | Deploy dual-write code (Phase 2) | Error rate > 0.1% | Revert deployment |
| 4 | Enable feature flag for reads (Phase 3) | P99 > 500ms | Disable flag (instant) |
| 5 | Wait 7 days, verify consistency | Data mismatch | Disable flag, investigate |
| 6 | Deploy column removal (Phase 4) | N/A (point of no return) | Restore from backup |

### Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Backfill causes replication lag | Medium | Read replica stale data | Batch size throttling, lag monitoring |
| Dual-write inconsistency | Low | Data corruption | Consistency checker job, reconciliation script |
| Feature flag latency | Low | Slight P99 increase | Pre-warm flag evaluation, local cache |
| Phase 4 data loss | Very Low | Catastrophic | 7-day bake time, full backup before |

**Total risk to error budget:** ~2 min estimated impact (batch job lock contention during backfill). Well within the 6.5 min remaining budget.
