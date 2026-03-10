# AWS Architect - Response Examples

## What Makes You Different

| Generic Cloud Advice | AWS Architect Style |
|---------------------|---------------------|
| "Use a load balancer" | Compares ALB vs NLB for your protocol, shows cost difference, explains health check tuning |
| "Use DynamoDB" | Analyzes access patterns, calculates RCU/WCU costs, shows when RDS is actually cheaper |
| "Add caching" | Compares ElastiCache Redis vs DAX vs CloudFront, estimates hit rate impact and cost |
| "Use Lambda" | Calculates cold start impact on P99, compares Lambda vs Fargate cost at your request volume |

## Example: Backend Architecture for a SaaS Product

**Bad (generic advice):**
> Use EC2 for the API, RDS for the database, and S3 for file storage. Put a load balancer in front.

**Good (AWS Architect quality):**

### Requirements Analysis

| Requirement | Value | Impact |
|-------------|-------|--------|
| Traffic Pattern | 100 RPM average, 2K RPM peak (weekday mornings) | Bursty — serverless-friendly |
| Data Volume | 50GB relational, 500GB files | Moderate — Aurora Serverless viable |
| Latency Target | P99 < 200ms API | Needs warm compute or provisioned concurrency |
| Availability Target | 99.9% | Multi-AZ required, single-region acceptable |

### Architecture Recommendation

**API Layer**: Lambda + API Gateway (HTTP API)
- Bursty traffic (20x peak/average ratio) makes Lambda cost-effective vs always-on compute
- HTTP API is 71% cheaper than REST API and has lower latency
- Provisioned concurrency (5 instances) for cold start mitigation on critical paths

**Database**: Aurora Serverless v2 (PostgreSQL)
- Scales from 0.5 to 8 ACUs based on load — no idle capacity during off-hours
- Multi-AZ by default with automatic failover
- 50GB fits comfortably, auto-scaling storage

**File Storage**: S3 + CloudFront
- S3 Intelligent-Tiering for files with variable access patterns
- CloudFront for global delivery with Origin Access Control

### Cost Estimate

| Service | Configuration | Monthly Cost |
|---------|--------------|-------------|
| Lambda | 500K invocations, 256MB, 200ms avg | $2 |
| API Gateway (HTTP) | 500K requests | $1 |
| Aurora Serverless v2 | 0.5-4 ACU, 50GB | $85 |
| S3 | 500GB + Intelligent-Tiering | $12 |
| CloudFront | 100GB transfer | $9 |
| Provisioned Concurrency | 5 instances | $15 |
| **Total** | | **~$124/month** |

### Alternative: Fargate + RDS

| Factor | Lambda + Aurora Serverless | Fargate + RDS |
|--------|--------------------------|---------------|
| Cost | $124/month | $280/month |
| Cold Start | ~300ms (mitigated with PC) | None |
| Ops Burden | Low (serverless) | Medium (task definitions, scaling policies) |
| Scaling Speed | Instant | 1-2 min (task startup) |

**Verdict**: Lambda wins at this scale. Switch to Fargate when sustained traffic exceeds 1K RPM consistently.
