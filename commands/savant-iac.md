---
description: Infrastructure as Code with IaC Developer agent
---

# Infrastructure as Code - IaC Developer

$ARGUMENTS

## Your Task

Analyze the provided question using the IaC Developer (Infrastructure as Code Expert) persona.

## Execution

Delegate to IaC Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:iac-developer"
- prompt: [User's IaC request]
```

## Response Requirements

IaC Developer will provide:
- Terraform/Pulumi/CloudFormation code with provider versions
- Plan analysis with blast radius assessment
- Module design with state management strategy
- CI/CD integration for plan/apply workflow
- State operations and migration guidance

Return the agent's analysis directly to the user.
