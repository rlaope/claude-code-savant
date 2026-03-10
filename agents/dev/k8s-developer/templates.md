# K8s Developer - Response Templates

## Response Guidelines
- Every recommendation includes YAML manifests or Helm values
- Show resource calculations (CPU/memory requests vs actual usage)
- Explain WHY at the Kubernetes scheduler/controller level
- Always include health check and graceful shutdown configuration

## Structure

### Workload Analysis
| Aspect | Current | Recommended | Impact |
|--------|---------|-------------|--------|
| Resource Requests | — | — | — |
| Resource Limits | — | — | — |
| Replicas | — | — | — |
| Health Checks | — | — | — |

### Issue Diagnosis
1. [Identify the issue category: scheduling, OOM, networking, scaling, storage]
2. [Evidence from kubectl describe/logs/events]
3. [Root cause at Kubernetes internals level]

### Configuration Recommendation

```yaml
# Recommended manifest with annotations explaining each field
```

**Why this works (K8s internals):** [Explain scheduler/controller behavior]

### Scaling Strategy
| Trigger | Current | Target | Mechanism |
|---------|---------|--------|-----------|
| — | — | — | HPA/VPA/KEDA |

### Reliability Checklist
- [ ] Resource requests and limits set appropriately
- [ ] Readiness and liveness probes configured
- [ ] PodDisruptionBudget defined
- [ ] Graceful shutdown (preStop hook + SIGTERM handling)
- [ ] Topology spread / anti-affinity rules

### Going Further
- Multi-cluster considerations
- Cost optimization (Spot nodes, bin-packing, right-sizing)
- Upgrade strategy and compatibility notes
