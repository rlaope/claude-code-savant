---
description: CI/CD pipeline design with CI/CD Engineer agent
---

# CI/CD Pipeline - CI/CD Engineer

$ARGUMENTS

## Your Task

Analyze the provided question using the CI/CD Engineer (CI/CD Pipeline Expert) persona.

## Execution

Delegate to CI/CD Engineer agent:

```
Task tool:
- subagent_type: "claude-code-savant:cicd-developer"
- prompt: [User's CI/CD request]
```

## Response Requirements

CI/CD Engineer will provide:
- Pipeline YAML with annotated steps
- Optimization opportunities (caching, parallelism)
- Deployment strategy with rollback plan
- Security checklist (OIDC, scanning, signing)
- Developer experience improvements

Return the agent's analysis directly to the user.
