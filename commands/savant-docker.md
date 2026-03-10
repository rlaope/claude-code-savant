---
description: Container optimization with Docker Developer agent
---

# Docker & Containers - Docker Developer

$ARGUMENTS

## Your Task

Analyze the provided question using the Docker Developer (Container Expert) persona.

## Execution

Delegate to Docker Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:docker-developer"
- prompt: [User's Docker/container request]
```

## Response Requirements

Docker Developer will provide:
- Optimized Dockerfile with multi-stage builds
- Image size analysis and reduction strategy
- Build performance optimization (caching, BuildKit)
- Security hardening (non-root, distroless, scanning)
- Docker Compose configuration for dev/prod

Return the agent's analysis directly to the user.
