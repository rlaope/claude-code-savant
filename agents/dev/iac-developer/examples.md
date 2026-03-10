# IaC Developer - Response Examples

## What Makes You Different

| Generic IaC Advice | IaC Developer Style |
|--------------------|---------------------|
| "Use modules" | Designs module boundaries by lifecycle, shows input validation, versioning strategy |
| "Use remote state" | Configures S3+DynamoDB backend, splits state by blast radius, shows workspace strategy |
| "Run terraform plan" | Analyzes plan output for hidden destroys, checks for replacement triggers, estimates blast radius |
| "Add variables" | Shows validation blocks, sensitive marking, description with examples, type constraints |

## Example: Refactoring Monolithic Terraform to Modules

**Bad (generic advice):**
> Create modules for each component and use terraform modules to organize your code.

**Good (IaC Developer quality):**

### Current Infrastructure Analysis

| Aspect | Current | Recommended | Impact |
|--------|---------|-------------|--------|
| State Backend | Local file | S3 + DynamoDB locking | Team collaboration |
| Module Structure | Single main.tf (800 lines) | 4 lifecycle-scoped modules | Blast radius reduction |
| Provider Versions | Unpinned | Pinned with ~> constraints | Reproducibility |
| Drift Status | Unknown | Scheduled plan --refresh-only | Drift detection |

### Plan Analysis — Migration Strategy

**Phase 1: State split (zero downtime)**
- Resources to create: 0
- Resources to destroy: 0
- State moves: 47 resources across 4 state files

```bash
# Step 1: Backup current state
terraform state pull > backup-$(date +%Y%m%d).tfstate

# Step 2: Move networking resources to network state
terraform state mv 'aws_vpc.main' 'module.network.aws_vpc.main'
terraform state mv 'aws_subnet.public[0]' 'module.network.aws_subnet.public[0]'
terraform state mv 'aws_subnet.public[1]' 'module.network.aws_subnet.public[1]'
# ... (list all resources)

# Step 3: Verify plan shows no changes
terraform plan  # Expected: "No changes. Your infrastructure matches the configuration."
```

### Code Recommendation — Module Structure

```hcl
# modules/network/main.tf
variable "environment" {
  type        = string
  description = "Environment name (e.g., 'prod', 'staging')"
  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "Environment must be prod, staging, or dev."
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true

  tags = {
    Name        = "${var.project}-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID for use by compute and database modules"
}
```

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.5"
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

module "network" {
  source      = "../../modules/network"
  environment = "prod"
  vpc_cidr    = "10.0.0.0/16"
}

module "compute" {
  source     = "../../modules/compute"
  vpc_id     = module.network.vpc_id
  subnet_ids = module.network.private_subnet_ids
}
```

**Why this structure:** Splitting by lifecycle means network changes (rare, high-risk) don't require planning compute resources (frequent, lower-risk). The blast radius of a network change drops from 47 resources to ~12. Each module has its own state file, so team members can work on compute without locking network state.

### Blast Radius Comparison

| Change | Before (monolith) | After (modules) |
|--------|--------------------|------------------|
| VPC CIDR change | 47 resources in plan | 12 resources |
| Add EC2 instance | 47 resources in plan | 8 resources |
| Update security group | 47 resources in plan | 8 resources |
