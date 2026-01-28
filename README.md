# claude-code-savant

A Claude Code plugin that provides expert explanations through distinctive personas: **Shakespeare** for code narratives and **Einstein** for deep understanding.

## Why Use This?

### Standard Claude Answer vs Einstein Persona

**Question: "What is MCP?"**

---

#### Standard Claude (Without Einstein)

> MCP stands for Model Context Protocol. It's a protocol that allows AI models to communicate with external tools.

---

#### Einstein Persona (With claude-code-savant)

> ## Model Context Protocol - A First Principles Explanation
>
> ### What Is It?
> MCP (Model Context Protocol) is an open standard that defines how AI assistants communicate with external tools and data sources. Think of it as a universal language that lets AI systems "speak" to the outside world.
>
> ### Why Does It Exist?
> AI models, no matter how intelligent, are inherently isolated. They can only work with what's in their training data or immediate context. MCP solves this by creating a standardized bridge.
>
> Imagine a genius trapped inside a house. They know everything, but have no windows to see outside, no phone to talk to others. MCP provides those windows and phones.
>
> ### How Does It Work?
> MCP operates through three core components:
>
> 1. **Host**: The application where the AI assistant runs (e.g., Claude Desktop)
> 2. **Server**: External programs that provide specific capabilities (e.g., file system access, database queries)
> 3. **Protocol**: The communication rules between them (based on JSON-RPC 2.0)
>
> ### The Analogy
> Just as USB is a standard that connects various devices to computers, MCP is a standard that connects various tools to AI. Before USB, each device needed a different port. Before MCP, each AI tool needed a different integration method.
>
> ### Practical Implications
> - **Developers**: Build an MCP server once, it works with all MCP-compatible AIs
> - **Users**: AI can safely read files, search the web, access databases
> - **Ecosystem**: AI capabilities become extensible like plugins

---

**See the difference?** Einstein doesn't just list information—it builds understanding from first principles.

## Installation

### Claude Code Plugin (Recommended)

```bash
# Clone or download this repository
git clone https://github.com/your-username/claude-code-savant.git
cd claude-code-savant

# Run Claude Code with the plugin
claude --plugin-dir .
```

### MCP Server (Alternative)

```bash
npm install
npm run build

# Add to Claude Desktop config
```

## Usage

### Commands

| Command | Persona | Best For |
|---------|---------|----------|
| `/savant-question` | Einstein | General questions, deep explanations |
| `/savant-code` | Shakespeare | Code analysis with flowcharts |

### Direct Agent Calls

```
claude-code-savant:einstein     # First principles explanations
claude-code-savant:shakespeare  # Narrative with diagrams
```

### Examples

```bash
# Start Claude with plugin
claude --plugin-dir /path/to/claude-code-savant

# Ask a question (Einstein)
/savant-question What is MCP?

# Analyze code (Shakespeare)
/savant-code Analyze this code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}
```

## Personas

### The Professor (Einstein)

- **Style**: First principles thinking, scientific precision
- **Strength**: Deep understanding, thorough explanations
- **Output**: Structured analysis with analogies and practical implications
- **Use when**: You want to truly understand something, not just know about it

### The Bard (Shakespeare)

- **Style**: Narrative storytelling, dramatic structure
- **Strength**: Making complex flows understandable through story
- **Output**: Rich narratives with Mermaid flowcharts
- **Use when**: Analyzing code structure and flow visually

## Project Structure

```
claude-code-savant/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── agents/
│   ├── einstein.md           # Einstein persona definition
│   └── shakespeare.md        # Shakespeare persona definition
├── commands/
│   ├── savant-question.md    # /savant-question command
│   └── savant-code.md        # /savant-code command
└── src/                      # MCP server (alternative)
```

## Development

```bash
# Test plugin locally
claude --plugin-dir .

# Build MCP server
npm run build

# Run tests
npm test
```

## License

MIT
