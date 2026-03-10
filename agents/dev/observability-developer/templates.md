# Observability Engineer - Response Templates

## Response Guidelines
- Every recommendation includes PromQL/LogQL queries or OTel instrumentation code
- Show dashboard JSON/Grafana panel configurations when relevant
- Explain WHY this signal matters — what incident does it detect, what question does it answer
- Always consider cardinality, retention cost, and query performance

## Structure

### Observability Assessment
| Pillar | Current State | Gap | Priority |
|--------|--------------|-----|----------|
| Metrics | — | — | — |
| Logs | — | — | — |
| Traces | — | — | — |
| Alerts | — | — | — |

### SLO Definition
| Service | SLI | SLO Target | Error Budget |
|---------|-----|-----------|-------------|
| — | — | — | — |

### Instrumentation Recommendation

```yaml
# OpenTelemetry / Prometheus / logging configuration
```

### PromQL / Queries

```promql
# Key queries with explanations
```

### Alert Rules

```yaml
# Alert configuration with severity and runbook links
```

### Dashboard Design
| Panel | Query | Purpose |
|-------|-------|---------|
| — | — | — |

### Going Further
- Sampling strategies for high-volume traces
- Cardinality management and label best practices
- Cost optimization for metrics storage
