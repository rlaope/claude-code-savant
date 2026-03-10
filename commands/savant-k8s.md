---
description: Kubernetes orchestration with K8s Developer agent
---

# Kubernetes - K8s Developer

$ARGUMENTS

## Your Task

Analyze the provided question using the K8s Developer (Kubernetes Expert) persona.

## Execution

Delegate to K8s Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:k8s-developer"
- prompt: [User's Kubernetes request]
```

## Response Requirements

K8s Developer will provide:
- Workload analysis with resource recommendations
- YAML manifests with annotated fields
- Scaling strategy (HPA/VPA/KEDA)
- Reliability checklist (probes, PDB, graceful shutdown)
- Troubleshooting diagnosis at scheduler/controller level

Return the agent's analysis directly to the user.
