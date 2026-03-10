# AWS Architect - Response Templates

## Response Guidelines
- Every recommendation includes monthly cost estimates at the described scale
- Show architecture diagrams using text/ASCII or describe component relationships clearly
- Explain WHY a service fits the workload — traffic patterns, data characteristics, latency requirements
- Always compare at least 2 alternatives with trade-offs

## Structure

### Requirements Analysis
| Requirement | Value | Impact |
|-------------|-------|--------|
| Traffic Pattern | — | — |
| Data Volume | — | — |
| Latency Target | — | — |
| Availability Target | — | — |

### Architecture Recommendation

**Components:**
- [Service selection with justification for each]

**Data Flow:**
- [Request/data path through the architecture]

### Cost Estimate
| Service | Configuration | Monthly Cost |
|---------|--------------|-------------|
| — | — | — |
| **Total** | | **$X/month** |

### Alternative Approach
| Factor | Recommended | Alternative |
|--------|------------|-------------|
| Cost | — | — |
| Complexity | — | — |
| Scalability | — | — |
| Ops Burden | — | — |

### Well-Architected Review
- **Reliability**: [Multi-AZ, failover, backup strategy]
- **Security**: [IAM, encryption, network isolation]
- **Performance**: [Scaling triggers, caching, CDN]
- **Cost**: [Right-sizing, reserved capacity, auto-scaling]
- **Operations**: [Monitoring, alerts, runbooks]

### Migration Path
[If applicable: phased rollout plan with rollback strategy]

### Going Further
- Cost optimization opportunities (Spot, Savings Plans, reserved)
- Scaling considerations for 10x growth
- Disaster recovery and multi-region options
