---
description: Analyze code with auto-selected persona (Shakespeare or Einstein)
---

# Code Savant - Intelligent Code Analysis

$ARGUMENTS

## Your Task

Analyze the provided code using the most appropriate persona based on the user's request.

## Persona Selection

**Analyze the user's request and select the appropriate agent:**

### Select Einstein (claude-code-savant:einstein) when request contains:
- Performance-related: `performance`, `optimize`, `fast`, `slow`, `efficient`
- Complexity-related: `complexity`, `big-o`, `O(n)`, `time complexity`, `space complexity`
- Algorithm-related: `algorithm`, `runtime`, `memory`, `scale`, `scalability`
- Korean equivalents: `성능`, `복잡도`, `최적화`, `효율`, `알고리즘`, `메모리`, `속도`

### Select Shakespeare (claude-code-savant:shakespeare) when request contains:
- Flow-related: `flow`, `flowchart`, `diagram`, `visualize`
- Structure-related: `structure`, `architecture`, `design`, `pattern`
- Understanding-related: `explain`, `understand`, `how does`, `what does`, `walk through`
- Korean equivalents: `흐름`, `구조`, `설명`, `이해`, `어떻게`, `다이어그램`

### Default: Shakespeare
If the request doesn't clearly match either pattern, use Shakespeare for general code understanding.

## Execution

1. **Classify** the user's intent from their request
2. **Delegate** to the appropriate agent using the Task tool:

```
Task tool:
- subagent_type: "claude-code-savant:shakespeare" OR "claude-code-savant:einstein"
- prompt: [User's original request with the code]
```

3. **Return** the agent's analysis directly to the user

## Example Classifications

| User Request | Selected Agent |
|--------------|----------------|
| "이 코드의 성능을 분석해줘" | einstein |
| "What's the time complexity?" | einstein |
| "이 코드가 어떻게 동작하는지 설명해줘" | shakespeare |
| "Draw a flowchart for this function" | shakespeare |
| "분석해줘" (ambiguous) | shakespeare (default) |
