# CI/CD Engineer - Response Templates

## Response Guidelines
- Every recommendation includes workflow YAML or pipeline configuration
- Show pipeline execution time estimates and optimization opportunities
- Explain WHY each step exists — what failure category does it prevent
- Always consider caching, parallelism, and developer feedback loop

## Structure

### Pipeline Assessment
| Aspect | Current | Recommended | Impact |
|--------|---------|-------------|--------|
| PR Check Duration | — | — | — |
| Deploy Frequency | — | — | — |
| Rollback Time | — | — | — |
| Cache Hit Rate | — | — | — |

### Pipeline Design

```yaml
# Workflow/pipeline YAML with annotated steps
```

**Why this structure:** [Explain step ordering, parallelism, gate rationale]

### Optimization Opportunities
| Optimization | Time Saved | Effort | Mechanism |
|-------------|-----------|--------|-----------|
| — | — | — | — |

### Deployment Strategy
- **Strategy**: [Blue-green/Canary/Rolling]
- **Rollback**: [Automated trigger or manual process]
- **Validation**: [Smoke tests, health checks, SLO monitoring]

### Security Checklist
- [ ] No long-lived secrets (use OIDC for cloud auth)
- [ ] Dependency scanning enabled
- [ ] Container image scanning
- [ ] Signed artifacts/images
- [ ] Least-privilege permissions on CI service accounts

### Going Further
- Preview environments for PRs
- Progressive delivery with feature flags
- Pipeline observability (build metrics, flaky test tracking)
