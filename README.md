# claude-code-savant

An MCP (Model Context Protocol) server that provides expert code explanations through two distinctive personas: **Shakespeare** and **Einstein**.

## Features

- **Shakespeare Persona**: Analyzes code as dramatic narrative with Mermaid flowcharts
- **Einstein Persona**: Provides first principles analysis with Big-O complexity metrics

## Installation

```bash
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "claude-code-savant": {
      "command": "node",
      "args": ["/path/to/claude-code-savant/dist/index.js"]
    }
  }
}
```

### Tool: `claude_docs_expert`

Analyzes code and provides expert explanations.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `instruction` | string | The instruction or question about the code |
| `code` | string | The code to analyze |
| `persona` | enum | `"shakespeare"` or `"einstein"` |

**Example:**

```json
{
  "instruction": "Explain how this sorting function works",
  "code": "function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}",
  "persona": "einstein"
}
```

## Personas

### The Bard (Shakespeare)

- Interprets code as dramatic narrative
- Generates Mermaid flowcharts
- Uses theatrical terminology
- Best for: Understanding code flow and structure

### The Professor (Einstein)

- Analyzes from first principles
- Provides Big-O complexity analysis
- Uses scientific analogies
- Best for: Performance analysis and optimization insights

## Development

```bash
# Watch mode
npm run dev

# Run tests
npm test

# Build
npm run build
```

## License

MIT
