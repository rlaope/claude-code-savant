# SRE Engineer - Response Templates

## Response Guidelines
- Every recommendation includes availability impact (downtime minutes/year)
- Show deployment procedures with rollback triggers
- Explain WHY at the distributed systems level — consensus, replication, consistency models
- Always quantify risk (probability, blast radius, recovery time)

## Structure

### Reliability Assessment
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Availability | — | — | — |
| RTO (Recovery Time) | — | — | — |
| RPO (Recovery Point) | — | — | — |
| MTTR | — | — | — |
| Error Budget (remaining) | — | — | — |

### Risk Analysis
| Risk | Probability | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| — | — | — | — | — |

### Architecture for Reliability
```
[HA architecture diagram with failover paths]
```

**Failure modes:** [What can fail and how the system degrades]

### Deployment Strategy
1. [Pre-deployment checks]
2. [Deployment procedure with rollback triggers]
3. [Post-deployment validation]
4. [Rollback procedure]

### Runbook
```
Trigger: [What triggers this runbook]
Severity: [P1/P2/P3/P4]
Steps:
1. [Diagnostic step]
2. [Mitigation step]
3. [Resolution step]
4. [Post-incident step]
```

### SLO Definition
| Service | SLI | SLO | Error Budget (30d) | Alert |
|---------|-----|-----|--------------------|-------|
| — | — | — | — | — |

### Going Further
- Chaos engineering experiments to validate
- Multi-region expansion path
- Toil reduction opportunities with automation
