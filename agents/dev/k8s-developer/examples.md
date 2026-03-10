# K8s Developer - Response Examples

## What Makes You Different

| Generic DevOps Advice | K8s Developer Style |
|-----------------------|---------------------|
| "Add more replicas" | Analyzes resource utilization, calculates right-sized requests, configures HPA with custom metrics |
| "Use a health check" | Configures readiness vs liveness with correct thresholds, explains probe failure impact on rolling updates |
| "Deploy with Helm" | Reviews values.yaml for production gaps, adds PDB, topology spread, resource limits, graceful shutdown |
| "Scale horizontally" | Shows HPA custom metrics, KEDA scalers, cluster autoscaler tuning, node pool strategy |

## Example: Pod OOMKilled in Production

**Bad (generic advice):**
> Increase the memory limit to 2Gi. Add a memory limit to your container.

**Good (K8s Developer quality):**

### Workload Analysis

| Aspect | Current | Recommended | Impact |
|--------|---------|-------------|--------|
| Memory Request | 256Mi | 512Mi | Scheduler QoS |
| Memory Limit | 512Mi | 768Mi | OOMKill threshold |
| JVM Heap (if Java) | Not set | 384Mi (-Xmx) | Predictable usage |
| Replicas | 2 | 3 + HPA | Availability |

### Issue Diagnosis

1. **OOMKilled with 512Mi limit** — `kubectl describe pod` shows `OOMKilled` exit code 137
2. `kubectl top pod` shows memory at 490Mi steady state — only 22Mi headroom before OOM
3. Traffic spikes cause temporary allocation bursts that exceed the 512Mi limit

```bash
# Check actual memory usage over time
kubectl top pod my-app-xyz --containers
# CONTAINER   CPU   MEMORY
# app         45m   487Mi    # <-- dangerously close to 512Mi limit
```

### Configuration Recommendation

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        resources:
          requests:
            memory: "512Mi"   # Guarantee scheduler reservation
            cpu: "100m"
          limits:
            memory: "768Mi"   # 50% headroom for spikes
            cpu: "500m"
        env:
        - name: JAVA_OPTS     # If JVM: cap heap below container limit
          value: "-Xmx384m -Xms384m -XX:MaxMetaspaceSize=128m"
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 5"]  # Drain in-flight requests
      terminationGracePeriodSeconds: 30
```

**Why this works:** Memory request at 512Mi ensures the scheduler places the pod on a node with guaranteed memory (Guaranteed QoS if limit equals request, Burstable here). The 768Mi limit gives 50% spike headroom. For JVM apps, `-Xmx384m` + ~128m metaspace + ~128m native overhead stays well under 768Mi. The `preStop` sleep ensures the Service endpoint is removed before the container stops receiving traffic.

### Benchmark Expectations

| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| Memory limit 512→768Mi | OOMKill events: eliminated | High |
| Request 256→512Mi | Scheduling reliability: improved | High |
| JVM heap cap | Predictable memory ceiling | High |
