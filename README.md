# claude-code-savant

A Claude Code plugin that provides expert explanations through distinctive personas: **Shakespeare** for code narratives, **Einstein** for deep understanding, **Steve Jobs** for visionary direction, and **Socrates** for error debugging.

![](./assets/savant.png)

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

### Via Marketplace (Recommended)

```bash
# Step 1: Add the marketplace
/plugin marketplace add rlaope/claude-code-savant

# Step 2: Install the plugin
/plugin install claude-code-savant
```

### Manual Installation (Alternative)

```bash
# Clone the repository
git clone https://github.com/rlaope/claude-code-savant.git
cd claude-code-savant

# Run Claude Code with the plugin
claude --plugin-dir .
```

## Usage

### First-Time Setup

After installation, run the setup wizard:

```bash
/savant-setup
```

This will configure:
- **Language**: English, 한국어, 日本語, or 中文
- **Default Mode**: Enable/disable auto-routing

### Language Settings

Change language anytime:

```bash
/savant-lang         # Interactive selection
/savant-lang en      # English
/savant-lang kr      # 한국어
/savant-lang jp      # 日本語
/savant-lang ch      # 中文
```

### Default Mode (Always-On Routing)

Want Savant to automatically analyze ALL your questions? Enable default mode:

```bash
/savant-default      # Enable - all questions auto-routed
/savant-default-off  # Disable - return to normal Claude
```

When enabled, just ask questions naturally - no commands needed!

### Smart Router (On-Demand)

Don't know which persona to use? Just use `/savant` and let the AI analyze your question!

```bash
/savant [your question here]
```

The Smart Router will:
1. Analyze your question using Opus model
2. Recommend the best persona with reasoning
3. Ask for your confirmation before proceeding
4. Execute with your chosen persona

### Commands

| Command | Persona | Best For |
|---------|---------|----------|
| `/savant-setup` | **Setup Wizard** | First-time configuration (language, default mode) |
| `/savant-lang` | **Language** | Change response language (en/kr/jp/ch) |
| `/savant-default` | **Enable Default** | Auto-route ALL questions (always-on mode) |
| `/savant-default-off` | **Disable Default** | Return to normal Claude behavior |
| `/savant` | **Smart Router** | Auto-detects and recommends the best persona |
| `/savant-question` | Einstein | General questions, deep explanations |
| `/savant-code` | Shakespeare | Code analysis with flowcharts |
| `/savant-new` | Steve Jobs | Project vision and next-step ideas |
| `/savant-fix` | Socrates | Error analysis, root cause debugging |
| `/savant-update` | **Update** | Check for updates and upgrade |

### Direct Agent Calls

```
claude-code-savant:router       # Smart question analyzer (uses Opus)
claude-code-savant:einstein     # First principles explanations
claude-code-savant:shakespeare  # Narrative with diagrams
claude-code-savant:stevejobs    # Visionary direction and ideas
claude-code-savant:socrates     # Error debugging and root cause analysis
```

### Examples

```bash
# Let AI choose the best persona (Smart Router)
/savant What is dependency injection and why do we need it?

# Ask a question (Einstein)
/savant-question What is MCP?

# Analyze code (Shakespeare)
/savant-code Analyze this code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}

# Get project direction (Steve Jobs)
/savant-new What should be the next feature for this project?

# Debug an error (Socrates)
/savant-fix NullPointerException at UserService.java:42
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

### The Visionary (Steve Jobs)

- **Style**: Bold, direct, user-obsessed thinking
- **Strength**: Seeing the next evolution and breakthrough opportunities
- **Output**: Clear vision with actionable ideas and what to kill
- **Use when**: You need direction on where to take your project next

### The Debugger (Socrates)

- **Style**: Socratic questioning, systematic investigation
- **Strength**: Tracing errors to root causes, finding edge cases
- **Output**: Thorough error analysis with fixes and prevention strategies
- **Use when**: You have an error, stack trace, or bug to investigate

## Project Structure

```
claude-code-savant/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── agents/
│   ├── router.md             # Smart Router (question analyzer)
│   ├── einstein.md           # Einstein persona definition
│   ├── shakespeare.md        # Shakespeare persona definition
│   ├── stevejobs.md          # Steve Jobs persona definition
│   └── socrates.md           # Socrates persona definition
├── commands/
│   ├── setup.md              # /savant-setup (first-time wizard)
│   ├── lang.md               # /savant-lang (language settings)
│   ├── default.md            # /savant-default (enable always-on mode)
│   ├── default-off.md        # /savant-default-off (disable default mode)
│   ├── savant.md             # /savant (smart router command)
│   ├── savant-question.md    # /savant-question command
│   ├── savant-code.md        # /savant-code command
│   ├── savant-new.md         # /savant-new command
│   ├── savant-fix.md         # /savant-fix command
│   └── update.md             # /savant-update command
└── src/                      # MCP server (alternative)
```

## Development

```bash
# Clone and test locally
git clone https://github.com/rlaope/claude-code-savant.git
cd claude-code-savant
claude --plugin-dir .

# Run tests
npm test
```

## License

MIT
