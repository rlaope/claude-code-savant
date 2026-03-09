import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
const SAVANT_ROOT = path.join(__dirname, "..", "..");
app.use(express.static(path.join(__dirname, "..", "public")));

const PERSONAS_DIR = path.join(SAVANT_ROOT, "agents");
const PROJECT_DIR = process.env.PROJECT_DIR || process.cwd();

interface PersonaInfo {
  id: string;
  name: string;
  nameKo: string;
  title: string;
  titleKo: string;
  initial: string;
  color: string;
  systemPrompt: string;
}

// ── Project Scanner ──────────────────────────────────────────────
function scanProject(dir: string): string {
  const lines: string[] = [];
  lines.push(`# Project Context`);
  lines.push(`**Working Directory**: \`${dir}\``);
  lines.push(`**Project Name**: \`${path.basename(dir)}\``);

  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      lines.push(`\n## Package Info`);
      lines.push(`- **Name**: ${pkg.name || "unknown"}`);
      lines.push(`- **Version**: ${pkg.version || "unknown"}`);
      lines.push(`- **Description**: ${pkg.description || "none"}`);
      if (pkg.scripts) lines.push(`- **Scripts**: ${Object.keys(pkg.scripts).join(", ")}`);
      if (pkg.dependencies) lines.push(`- **Dependencies**: ${Object.keys(pkg.dependencies).join(", ")}`);
      if (pkg.devDependencies) lines.push(`- **Dev Dependencies**: ${Object.keys(pkg.devDependencies).join(", ")}`);
    } catch { /* ignore */ }
  }

  for (const f of ["pyproject.toml", "Cargo.toml", "go.mod", "pom.xml", "build.gradle"]) {
    const fp = path.join(dir, f);
    if (fs.existsSync(fp)) {
      lines.push(`\n## Build Config: ${f}`);
      const content = fs.readFileSync(fp, "utf-8");
      lines.push("```\n" + content.slice(0, 2000) + "\n```");
    }
  }

  const readmePath = path.join(dir, "README.md");
  if (fs.existsSync(readmePath)) {
    lines.push(`\n## README (excerpt)`);
    lines.push(fs.readFileSync(readmePath, "utf-8").slice(0, 3000));
  }

  const claudeMdPath = path.join(dir, "CLAUDE.md");
  if (fs.existsSync(claudeMdPath)) {
    lines.push(`\n## CLAUDE.md (Project Instructions)`);
    lines.push(fs.readFileSync(claudeMdPath, "utf-8").slice(0, 2000));
  }

  lines.push(`\n## Directory Structure\n\`\`\``);
  try { lines.push(buildTree(dir, 2)); } catch { lines.push("(could not read)"); }
  lines.push("```");

  try {
    const branch = execSync("git branch --show-current", { cwd: dir, encoding: "utf-8" }).trim();
    const log = execSync("git log --oneline -5", { cwd: dir, encoding: "utf-8" }).trim();
    lines.push(`\n## Git Info\n- **Branch**: ${branch}\n- **Recent commits**:\n\`\`\`\n${log}\n\`\`\``);
  } catch { /* not a git repo */ }

  const srcDirs = ["src", "lib", "app", "pages", "components"];
  for (const sd of srcDirs) {
    const sdPath = path.join(dir, sd);
    if (fs.existsSync(sdPath) && fs.statSync(sdPath).isDirectory()) {
      lines.push(`\n## Key Source Files (${sd}/)`);
      for (const f of collectFiles(sdPath, 3).slice(0, 30)) {
        lines.push(`- \`${path.relative(dir, f)}\` (${fs.statSync(f).size} bytes)`);
      }
    }
  }

  return lines.join("\n");
}

function buildTree(dir: string, maxDepth: number, depth = 0, prefix = ""): string {
  if (depth >= maxDepth) return "";
  const ignore = new Set(["node_modules", ".git", "dist", ".next", "__pycache__", ".venv", "target", "build", ".omc"]);
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith(".") || e.name === ".env.example")
    .filter(e => !ignore.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
  const lines: string[] = [];
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    lines.push(`${prefix}${isLast ? "└── " : "├── "}${entry.isDirectory() ? "" : ""}${entry.name}`);
    if (entry.isDirectory()) {
      const sub = buildTree(path.join(dir, entry.name), maxDepth, depth + 1, prefix + (isLast ? "    " : "│   "));
      if (sub) lines.push(sub);
    }
  });
  return lines.join("\n");
}

function collectFiles(dir: string, maxDepth: number, depth = 0): string[] {
  if (depth >= maxDepth) return [];
  const ignore = new Set(["node_modules", ".git", "dist", "__pycache__", ".venv", "target"]);
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full, maxDepth, depth + 1));
    else files.push(full);
  }
  return files;
}

// ── Persona Loader ───────────────────────────────────────────────
function loadPersonas(): Map<string, PersonaInfo> {
  const personas = new Map<string, PersonaInfo>();
  const meta: Record<string, { name: string; nameKo: string; title: string; titleKo: string; initial: string; color: string }> = {
    einstein:    { name: "Einstein",    nameKo: "아인슈타인", title: "The Professor",  titleKo: "개념 정리 에이전트",     initial: "E", color: "#6C5CE7" },
    shakespeare: { name: "Shakespeare", nameKo: "셰익스피어", title: "The Bard",       titleKo: "코드 분석 에이전트",     initial: "S", color: "#E17055" },
    socrates:    { name: "Socrates",    nameKo: "소크라테스",  title: "The Debugger",   titleKo: "디버깅 에이전트",        initial: "So", color: "#00B894" },
    stevejobs:   { name: "Steve Jobs",  nameKo: "스티브 잡스", title: "The Visionary",  titleKo: "방향 제시 에이전트",     initial: "J", color: "#0984E3" },
  };

  for (const [id, info] of Object.entries(meta)) {
    const filePath = path.join(PERSONAS_DIR, `${id}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const stripped = content.replace(/^---[\s\S]*?---\n*/, "");
      personas.set(id, { id, ...info, systemPrompt: stripped });
    }
  }
  return personas;
}

const personas = loadPersonas();
const projectContext = scanProject(PROJECT_DIR);

console.log(`\n  Project: ${path.basename(PROJECT_DIR)}`);
console.log(`  Context: ${(projectContext.length / 1024).toFixed(1)}KB\n`);

// ── Helpers ──────────────────────────────────────────────────────
function formatApiError(raw: string): string {
  if (raw.includes("credit balance is too low")) {
    return "Anthropic API 크레딧이 부족합니다. https://console.anthropic.com/settings/plans 에서 충전해주세요.";
  }
  if (raw.includes("invalid x-api-key") || raw.includes("invalid api key")) {
    return "API 키가 유효하지 않습니다. 키를 확인하고 다시 설정해주세요.";
  }
  if (raw.includes("rate limit")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  }
  if (raw.includes("overloaded")) {
    return "Anthropic 서버가 혼잡합니다. 잠시 후 다시 시도해주세요.";
  }
  return raw;
}

function getClient(req?: express.Request): Anthropic {
  const apiKey = req?.headers["x-api-key"] as string || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey });
}

function buildSystemPrompt(persona: PersonaInfo, lang: string): string {
  const langInstruction = lang === "ko"
    ? "IMPORTANT: You MUST respond in Korean (한국어). Always use Korean regardless of the user's language."
    : "IMPORTANT: Respond in English.";

  return `${persona.systemPrompt}

---

## Your Role in This Chat

You are a conversational AI assistant embodying the ${persona.name} persona. You are helping a developer who is working on the project described below. You deeply understand this project's codebase, architecture, and conventions.

Respond conversationally while staying in character. Be helpful, specific, and reference actual files/code from the project when relevant.

${langInstruction}

${projectContext}`;
}

function buildGroupSystemPrompt(lang: string): string {
  const personaList = Array.from(personas.values());
  const personaDescriptions = personaList.map(p =>
    `- **${p.name}** (${p.title}): ${p.systemPrompt.split("\n").slice(0, 3).join(" ").slice(0, 200)}`
  ).join("\n");

  const langInstruction = lang === "ko"
    ? "IMPORTANT: You MUST respond in Korean (한국어). 각 페르소나의 이름은 영어로 유지하되 대화 내용은 모두 한국어로."
    : "IMPORTANT: Respond in English.";

  return `You are simulating a group discussion between 4 genius personas. When the user asks a question, ALL 4 personas respond with their unique perspective. Each persona stays in character.

## The Personas
${personaDescriptions}

## Response Format
Always respond with ALL 4 personas giving their take. Use this exact format:

**Einstein**: [Einstein's response in character - first principles, scientific]

**Shakespeare**: [Shakespeare's response in character - narrative, dramatic]

**Socrates**: [Socrates's response in character - questioning, investigative]

**Steve Jobs**: [Steve Jobs's response in character - bold, visionary]

After all 4 respond, add a brief synthesis:

**Consensus**: [1-2 sentences summarizing where they agree and the key takeaway]

## Rules
- Each persona gives a substantive response (2-5 sentences minimum)
- They can reference and build on each other's points
- They can disagree with each other
- Keep each persona's unique voice and style
- Be specific about the project's actual code and architecture

${langInstruction}

${projectContext}`;
}

async function streamChat(
  req: express.Request,
  res: express.Response,
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const client = getClient(req);
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    const message = formatApiError(raw);
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}

// ── API Routes ───────────────────────────────────────────────────

app.get("/api/project", (_req, res) => {
  res.json({ name: path.basename(PROJECT_DIR), path: PROJECT_DIR });
});

// Full project context (what the AI knows)
app.get("/api/project/context", (_req, res) => {
  res.json({ context: projectContext });
});

app.get("/api/personas", (_req, res) => {
  const list = Array.from(personas.values()).map(({ id, name, nameKo, title, titleKo, initial, color }) => ({
    id, name, nameKo, title, titleKo, initial, color,
  }));
  res.json(list);
});

app.post("/api/read-file", (req, res) => {
  const { filePath } = req.body as { filePath: string };
  const resolved = path.resolve(PROJECT_DIR, filePath);
  if (!resolved.startsWith(PROJECT_DIR)) { res.status(403).json({ error: "Access denied" }); return; }
  if (!fs.existsSync(resolved)) { res.status(404).json({ error: "File not found" }); return; }
  res.json({ content: fs.readFileSync(resolved, "utf-8").slice(0, 50000) });
});

// Single persona chat
app.post("/api/chat", async (req, res) => {
  const { personaId, messages, lang = "en" } = req.body as {
    personaId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
  };

  const persona = personas.get(personaId);
  if (!persona) { res.status(400).json({ error: "Unknown persona" }); return; }

  await streamChat(req, res, buildSystemPrompt(persona, lang), messages);
});

// Group chat (all 4 personas)
app.post("/api/chat/group", async (req, res) => {
  const { messages, lang = "en" } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
  };

  await streamChat(req, res, buildGroupSystemPrompt(lang), messages);
});

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`  Savant Chat -> http://localhost:${PORT}\n`);
});
