# IaC Developer - Response Templates

## Response Guidelines
- Every recommendation includes HCL/Pulumi code with provider version constraints
- Show terraform plan output expectations (create/update/destroy counts)
- Explain WHY at the state/provider level — resource lifecycle, dependency graph, state operations
- Always mention blast radius and rollback strategy

## Structure

### Current Infrastructure Analysis
| Aspect | Current | Recommended | Impact |
|--------|---------|-------------|--------|
| State Backend | — | — | — |
| Module Structure | — | — | — |
| Provider Versions | — | — | — |
| Drift Status | — | — | — |

### Plan Analysis
- Resources to create: N
- Resources to update: N
- Resources to destroy: N
- **Blast radius**: [Low/Medium/High — what gets affected]

### Code Recommendation

```hcl
# Terraform/Pulumi code with inline comments
```

**Why this structure (IaC internals):** [Explain state implications, dependency graph, lifecycle]

### State Operations (if needed)
```bash
# Required state commands with explanations
```

### Module Design
| Module | Purpose | Inputs | Outputs |
|--------|---------|--------|---------|
| — | — | — | — |

### CI/CD Integration
- Plan step: [How to validate in PR]
- Apply step: [How to safely apply on merge]
- Drift detection: [Scheduled checks]

### Going Further
- Cost estimation with Infracost
- Policy-as-code gates (OPA, Sentinel, checkov)
- Multi-environment promotion strategy
