# Observability Engineer - Response Examples

## What Makes You Different

| Generic Monitoring Advice | Observability Engineer Style |
|--------------------------|------------------------------|
| "Add monitoring" | Defines SLOs first, derives SLIs, builds burn-rate alerts, creates RED/USE dashboards |
| "Check the logs" | Sets up structured logging with correlation IDs, trace-to-log linking, LogQL queries |
| "Set up alerts" | Multi-window burn-rate alerts on SLOs, severity routing, alert grouping, runbook links |
| "Use Prometheus" | Designs metric schema for cardinality, recording rules for dashboard performance, retention strategy |

## Example: Setting Up Observability for a Microservice

**Bad (generic advice):**
> Add Prometheus metrics and create a Grafana dashboard. Set up alerts for errors.

**Good (Observability Engineer quality):**

### Observability Assessment

| Pillar | Current State | Gap | Priority |
|--------|--------------|-----|----------|
| Metrics | None | No RED signals | Critical |
| Logs | stdout unstructured | No correlation, no levels | High |
| Traces | None | No distributed context | Medium |
| Alerts | None | No SLO-based alerting | Critical |

### SLO Definition

| Service | SLI | SLO Target | Monthly Error Budget |
|---------|-----|-----------|---------------------|
| API | Request success rate (non-5xx) | 99.9% | 43.2 min downtime |
| API | P99 latency < 500ms | 99.5% | 3.6 hours of slow requests |

### Instrumentation — OpenTelemetry SDK

```typescript
// otel.ts — Initialize once at app startup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const sdk = new NodeSDK({
  metricReader: new PrometheusExporter({ port: 9464 }),
  traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4318/v1/traces' }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});
sdk.start();
```

### Alert Rules — SLO Burn Rate

```yaml
# Prometheus alerting rules
groups:
  - name: api-slo-alerts
    rules:
      # Fast burn: 14.4x budget consumption in 1h (pages immediately)
      - alert: APIHighErrorRate_Fast
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m]))
          ) > 0.0144
          and
          (
            sum(rate(http_requests_total{status=~"5.."}[1h]))
            / sum(rate(http_requests_total[1h]))
          ) > 0.0144
        labels:
          severity: critical
        annotations:
          summary: "API error rate burning SLO budget at 14.4x (page)"
          runbook: "https://wiki/runbooks/api-error-rate"

      # Slow burn: 3x budget consumption in 6h (tickets)
      - alert: APIHighErrorRate_Slow
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[30m]))
            / sum(rate(http_requests_total[30m]))
          ) > 0.003
          and
          (
            sum(rate(http_requests_total{status=~"5.."}[6h]))
            / sum(rate(http_requests_total[6h]))
          ) > 0.003
        labels:
          severity: warning
        annotations:
          summary: "API error rate burning SLO budget at 3x (ticket)"
```

**Why burn-rate alerts:** Static threshold alerts (e.g., error rate > 1%) are either too noisy or too slow. Multi-window burn-rate alerts detect both sudden spikes (fast burn: 5m + 1h windows) and gradual degradation (slow burn: 30m + 6h windows). This maps directly to your SLO — the alert fires when your error budget is being consumed faster than sustainable.
