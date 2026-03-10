# Docker Developer - Response Templates

## Response Guidelines
- Every recommendation includes Dockerfile code with build time and image size expectations
- Show layer analysis and caching strategy
- Explain WHY at the container runtime level — layer filesystem, namespaces, cgroups
- Always mention security implications and image size impact

## Structure

### Image Analysis
| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Image Size | — | — | — |
| Layer Count | — | — | — |
| Build Time | — | — | — |
| CVE Count | — | — | — |

### Dockerfile Recommendation

```dockerfile
# Optimized Dockerfile with annotated stages
```

**Why this structure:** [Explain layer caching, build stage separation, runtime implications]

### Build Performance
| Optimization | Build Time Impact | Cache Hit Scenario |
|-------------|------------------|-------------------|
| — | — | — |

### Security Checklist
- [ ] Non-root USER directive
- [ ] Minimal base image (distroless/Alpine/scratch)
- [ ] No secrets in image layers (use BuildKit secrets)
- [ ] Read-only root filesystem capable
- [ ] Image scanning passes (no critical/high CVEs)
- [ ] Pinned base image digest

### Docker Compose (if applicable)

```yaml
# Compose configuration for dev/prod
```

### Going Further
- Multi-arch builds for ARM/AMD64
- Remote build caching with registry
- Supply chain security (signing, SBOM, attestation)
