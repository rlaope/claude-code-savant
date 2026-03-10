import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync, spawn } from "child_process";

type Provider = "local" | "anthropic" | "openai" | "gemini";

// Find claude CLI path
function findClaudeCli(): string | null {
  // Check common locations
  const candidates = [
    "claude",
    path.join(process.env.HOME || "", ".nvm/versions/node", process.version, "bin/claude"),
    "/usr/local/bin/claude",
    "/opt/homebrew/bin/claude",
  ];
  for (const cmd of candidates) {
    try {
      const resolved = execSync(`which ${cmd} 2>/dev/null || echo ${cmd}`, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
      if (fs.existsSync(resolved)) return resolved;
    } catch { /* continue */ }
  }
  try {
    return execSync("which claude", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}
const claudeCliPath = findClaudeCli();
const claudeCliAvailable = !!claudeCliPath;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
const SAVANT_ROOT = path.join(__dirname, "..", "..");
app.use(express.static(path.join(__dirname, "..", "public")));

const PERSONAS_DIR = path.join(SAVANT_ROOT, "agents");

function detectProjectDir(): string {
  if (process.env.PROJECT_DIR) return process.env.PROJECT_DIR;
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return process.cwd();
  }
}
const PROJECT_DIR = detectProjectDir();

type PersonaCategory = "dev" | "biz";

interface PersonaInfo {
  id: string;
  name: string;
  nameKo: string;
  title: string;
  titleKo: string;
  initial: string;
  color: string;
  category: PersonaCategory;
  systemPrompt: string;
}

type PersonaMeta = { name: string; nameKo: string; title: string; titleKo: string; initial: string; color: string };

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
const DEV_META: Record<string, PersonaMeta> = {
  einstein:    { name: "Einstein",    nameKo: "아인슈타인", title: "The Professor",  titleKo: "개념 정리 에이전트",     initial: "E", color: "#6C5CE7" },
  shakespeare: { name: "Shakespeare", nameKo: "셰익스피어", title: "The Bard",       titleKo: "코드 분석 에이전트",     initial: "S", color: "#E17055" },
  socrates:    { name: "Socrates",    nameKo: "소크라테스",  title: "The Debugger",   titleKo: "디버깅 에이전트",        initial: "So", color: "#00B894" },
  stevejobs:   { name: "Steve Jobs",  nameKo: "스티브 잡스", title: "The Visionary",  titleKo: "방향 제시 에이전트",     initial: "J", color: "#0984E3" },
};

const BIZ_META: Record<string, PersonaMeta> = {
  sayno:     { name: "SayNo",            nameKo: "세이노",       title: "The Strategist",  titleKo: "사업/수익화 에이전트",  initial: "₩", color: "#F39C12" },
  finance:   { name: "Finance PM",       nameKo: "파이낸스 PM",  title: "Investment & Finance", titleKo: "재무/투자 에이전트", initial: "F", color: "#8E44AD" },
  growth:    { name: "Growth PM",        nameKo: "그로스 PM",    title: "Marketing & Growth",   titleKo: "마케팅/그로스 에이전트", initial: "G", color: "#27AE60" },
  legal:     { name: "Legal Advisor",    nameKo: "법률 어드바이저", title: "Business Law",     titleKo: "법률/규제 에이전트",  initial: "L", color: "#2C3E50" },
  fashion:   { name: "Fashion PM",       nameKo: "패션 PM",      title: "Fashion & Retail",     titleKo: "패션 사업 에이전트", initial: "Fa", color: "#E91E63" },
  logistics: { name: "Logistics Manager", nameKo: "물류 매니저",  title: "Supply Chain & Ops",   titleKo: "물류/SCM 에이전트",  initial: "Lo", color: "#795548" },
  fnb:       { name: "F&B PM",           nameKo: "F&B PM",       title: "Food & Beverage",      titleKo: "요식업 에이전트",    initial: "Fb", color: "#FF5722" },
  saas:      { name: "SaaS PM",          nameKo: "SaaS PM",      title: "Software Business",    titleKo: "SaaS/플랫폼 에이전트", initial: "Sa", color: "#3F51B5" },
  ecommerce: { name: "E-commerce PM",   nameKo: "이커머스 PM",  title: "Online Retail",        titleKo: "이커머스 에이전트",   initial: "Ec", color: "#FF9800" },
  realestate:{ name: "Real Estate PM",  nameKo: "부동산 PM",    title: "Property & PropTech",   titleKo: "부동산 에이전트",     initial: "Re", color: "#607D8B" },
  healthcare:{ name: "Healthcare PM",   nameKo: "헬스케어 PM",  title: "HealthTech",           titleKo: "헬스케어 에이전트",   initial: "He", color: "#4CAF50" },
  content:   { name: "Content PM",      nameKo: "콘텐츠 PM",    title: "Media & Creator",      titleKo: "콘텐츠/미디어 에이전트", initial: "Co", color: "#9C27B0" },
  hr:        { name: "HR PM",           nameKo: "HR PM",        title: "People & HRTech",      titleKo: "인사/채용 에이전트",  initial: "Hr", color: "#009688" },
  education: { name: "Education PM",    nameKo: "교육 PM",      title: "EdTech & Learning",    titleKo: "교육/에듀테크 에이전트", initial: "Ed", color: "#673AB7" },
  travel:    { name: "Travel PM",       nameKo: "여행 PM",      title: "Tourism & Hospitality", titleKo: "여행/관광 에이전트",  initial: "Tr", color: "#00BCD4" },
};

// ── Meta Overrides ───────────────────────────────────────────────
const META_OVERRIDES_PATH = path.join(PERSONAS_DIR, "meta-overrides.json");

function loadMetaOverrides(): Record<string, Partial<PersonaMeta>> {
  try {
    if (fs.existsSync(META_OVERRIDES_PATH)) {
      return JSON.parse(fs.readFileSync(META_OVERRIDES_PATH, "utf-8"));
    }
  } catch { /* ignore */ }
  return {};
}

function saveMetaOverrides(overrides: Record<string, Partial<PersonaMeta>>): void {
  fs.writeFileSync(META_OVERRIDES_PATH, JSON.stringify(overrides, null, 2), "utf-8");
}

const metaOverrides = loadMetaOverrides();

// Apply overrides to meta objects
function applyOverrides(id: string, meta: PersonaMeta): PersonaMeta {
  const override = metaOverrides[id];
  if (!override) return meta;
  return { ...meta, ...override };
}

function loadPersonaFromFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return content.replace(/^---[\s\S]*?---\n*/, "");
}

function loadPersonaFromDir(dirOrFile: string): string | null {
  // If it's a file (e.g., router.md), load directly
  if (fs.existsSync(dirOrFile) && fs.statSync(dirOrFile).isFile()) {
    return loadPersonaFromFile(dirOrFile);
  }

  // If it's a directory, load all .md files in order
  if (fs.existsSync(dirOrFile) && fs.statSync(dirOrFile).isDirectory()) {
    const order = ['persona.md', 'templates.md', 'examples.md', 'benchmarks.md'];
    const parts: string[] = [];

    for (const filename of order) {
      const filePath = path.join(dirOrFile, filename);
      const content = loadPersonaFromFile(filePath);
      if (content) parts.push(content);
    }

    return parts.length > 0 ? parts.join('\n\n---\n\n') : null;
  }

  return null;
}

function loadPersonas(): Map<string, PersonaInfo> {
  const result = new Map<string, PersonaInfo>();

  // Dev agents from agents/dev/{id}/
  for (const [id, info] of Object.entries(DEV_META)) {
    const prompt = loadPersonaFromDir(path.join(PERSONAS_DIR, "dev", id));
    const meta = applyOverrides(id, info);
    if (prompt) result.set(id, { id, ...meta, category: "dev", systemPrompt: prompt });
  }

  // Biz agents from agents/biz/{id}/ (sayno is now under agents/dev/sayno/)
  for (const [id, info] of Object.entries(BIZ_META)) {
    const dirPath = id === "sayno"
      ? path.join(PERSONAS_DIR, "dev", id)
      : path.join(PERSONAS_DIR, "biz", id);
    const prompt = loadPersonaFromDir(dirPath);
    const meta = applyOverrides(id, info);
    if (prompt) result.set(id, { id, ...meta, category: "biz", systemPrompt: prompt });
  }

  return result;
}

const personas = loadPersonas();
const projectContext = scanProject(PROJECT_DIR);

console.log(`\n  Project: ${path.basename(PROJECT_DIR)}`);
console.log(`  Context: ${(projectContext.length / 1024).toFixed(1)}KB`);
console.log(`  Claude CLI: ${claudeCliAvailable ? "available (default provider)" : "not found"}\n`);

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

const PROVIDER_MODELS: Record<Provider, string> = {
  local: "claude-code",
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  gemini: "gemini-2.0-flash",
};

const PROVIDER_ENV_KEYS: Record<Provider, string> = {
  local: "",
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

function getApiKey(provider: Provider, req?: express.Request): string {
  if (provider === "local") return "";
  const headerKey = req?.headers["x-api-key"] as string;
  const envKey = process.env[PROVIDER_ENV_KEYS[provider]];
  const key = headerKey || envKey;
  if (!key) throw new Error(`${PROVIDER_ENV_KEYS[provider]} not set`);
  return key;
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

function buildGroupSystemPrompt(lang: string, category: PersonaCategory = "dev", activeIds?: string[]): string {
  let personaList: PersonaInfo[];

  if (category === "biz" && activeIds && activeIds.length > 0) {
    personaList = activeIds.map(id => personas.get(id)).filter((p): p is PersonaInfo => !!p);
  } else {
    personaList = Array.from(personas.values()).filter(p => p.category === category);
  }

  const count = personaList.length;
  const personaDescriptions = personaList.map(p =>
    `- **${p.name}** (${p.title}): ${p.systemPrompt.split("\n").slice(0, 3).join(" ").slice(0, 200)}`
  ).join("\n");

  const responseFormat = personaList.map(p =>
    `**${p.name}**: [${p.name}'s response in character]`
  ).join("\n\n");

  const langInstruction = lang === "ko"
    ? "IMPORTANT: You MUST respond in Korean (한국어). 각 페르소나의 이름은 영어로 유지하되 대화 내용은 모두 한국어로."
    : "IMPORTANT: Respond in English.";

  const topicFocus = category === "biz"
    ? "Focus on business strategy, monetization, market analysis, and financial viability."
    : "Be specific about the project's actual code and architecture.";

  return `You are simulating a group discussion between ${count} expert personas. When the user asks a question, ALL ${count} personas respond with their unique perspective. Each persona stays in character.

## The Personas
${personaDescriptions}

## Response Format
Always respond with ALL ${count} personas giving their take. Use this exact format:

${responseFormat}

After all ${count} respond, add a brief synthesis:

**Consensus**: [1-2 sentences summarizing where they agree and the key takeaway]

## Rules
- Each persona gives a substantive response (2-5 sentences minimum)
- They can reference and build on each other's points
- They can disagree with each other
- Keep each persona's unique voice and style
- ${topicFocus}

${langInstruction}

${projectContext}`;
}

async function streamAnthropic(
  apiKey: string, systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  res: express.Response
): Promise<void> {
  const client = new Anthropic({ apiKey });
  const stream = await client.messages.stream({
    model: PROVIDER_MODELS.anthropic,
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
    }
  }
}

async function streamOpenAI(
  apiKey: string, systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  res: express.Response
): Promise<void> {
  const client = new OpenAI({ apiKey });
  const stream = await client.chat.completions.create({
    model: PROVIDER_MODELS.openai,
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
}

async function streamGemini(
  apiKey: string, systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  res: express.Response
): Promise<void> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: PROVIDER_MODELS.gemini,
    systemInstruction: systemPrompt,
  });
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === "user" ? "user" as const : "model" as const,
    parts: [{ text: m.content }],
  }));
  const lastMsg = messages[messages.length - 1]?.content || "";
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMsg);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
}

async function streamLocal(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  res: express.Response
): Promise<void> {
  const historyParts = messages.slice(0, -1).map(m =>
    `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
  );
  const lastMsg = messages[messages.length - 1]?.content || "";
  const userPrompt = historyParts.length > 0
    ? [...historyParts, `User: ${lastMsg}`].join("\n\n")
    : lastMsg;

  console.error(`[claude-local] system: ${systemPrompt.length} chars, user: ${userPrompt.length} chars`);
  res.write(`data: ${JSON.stringify({ status: "Initializing Claude Code..." })}\n\n`);

  return new Promise((resolve, reject) => {
    const cleanEnv = { ...process.env };
    for (const key of Object.keys(cleanEnv)) {
      if (key.toUpperCase().includes("CLAUDE")) delete cleanEnv[key];
    }

    const proc = spawn(claudeCliPath!, [
      "-p", userPrompt,
      "--system-prompt", systemPrompt,
      "--output-format", "text",
      "--max-turns", "1",
    ], {
      stdio: ["ignore", "pipe", "pipe"],
      env: cleanEnv,
    });
    console.error(`[claude-local] PID: ${proc.pid || "FAILED"}`);

    let hasText = false;

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text) {
        if (!hasText) {
          res.write(`data: ${JSON.stringify({ status: "" })}\n\n`);
          hasText = true;
        }
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const msg = chunk.toString().trim();
      if (msg) console.error(`[claude-local] ${msg}`);
    });

    proc.on("close", (code) => {
      console.error(`[claude-local] Process exited with code: ${code}`);
      resolve();
    });

    proc.on("error", (err) => {
      console.error(`[claude-local] Spawn error: ${err.message}`);
      reject(err);
    });
  });
}

async function streamChat(
  req: express.Request,
  res: express.Response,
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  provider: Provider = "anthropic"
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    if (provider === "local") {
      if (!claudeCliAvailable) throw new Error("Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code");
      await streamLocal(systemPrompt, messages, res);
    } else {
      const apiKey = getApiKey(provider, req);
      if (provider === "openai") await streamOpenAI(apiKey, systemPrompt, messages, res);
      else if (provider === "gemini") await streamGemini(apiKey, systemPrompt, messages, res);
      else await streamAnthropic(apiKey, systemPrompt, messages, res);
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

// Translate project context to Korean
app.post("/api/project/context/translate", async (req, res) => {
  const { provider = "anthropic" } = req.body as { provider?: Provider };
  const systemPrompt = "You are a translator. Translate the following project context document from English to Korean. Keep code blocks, file paths, and technical terms as-is. Translate headings, descriptions, and explanatory text to natural Korean.";

  try {
    const apiKey = getApiKey(provider as Provider, req);
    let translated: string;

    if (provider === "openai") {
      const client = new OpenAI({ apiKey });
      const result = await client.chat.completions.create({
        model: PROVIDER_MODELS.openai,
        max_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: projectContext },
        ],
      });
      translated = result.choices[0]?.message?.content || "";
    } else if (provider === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: PROVIDER_MODELS.gemini, systemInstruction: systemPrompt });
      const result = await model.generateContent(projectContext);
      translated = result.response.text();
    } else {
      const client = new Anthropic({ apiKey });
      const result = await client.messages.create({
        model: PROVIDER_MODELS.anthropic,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: projectContext }],
      });
      translated = result.content[0]?.type === "text" ? result.content[0].text : "";
    }

    res.json({ translated });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "Translation failed";
    res.status(500).json({ error: formatApiError(raw) });
  }
});

app.get("/api/personas", (_req, res) => {
  const list = Array.from(personas.values()).map(({ id, name, nameKo, title, titleKo, initial, color, category }) => ({
    id, name, nameKo, title, titleKo, initial, color, category,
  }));
  res.json(list);
});

// Update persona meta (name, title, etc.)
app.put("/api/persona/:id/meta", (req, res) => {
  const { id } = req.params;
  const updates = req.body as Partial<PersonaMeta>;

  if (!personas.has(id)) {
    res.status(404).json({ error: "Unknown persona" });
    return;
  }

  // Update in-memory
  const persona = personas.get(id)!;
  if (updates.name !== undefined) persona.name = updates.name;
  if (updates.nameKo !== undefined) persona.nameKo = updates.nameKo;
  if (updates.title !== undefined) persona.title = updates.title;
  if (updates.titleKo !== undefined) persona.titleKo = updates.titleKo;

  // Persist to overrides file
  metaOverrides[id] = { ...metaOverrides[id], ...updates };
  saveMetaOverrides(metaOverrides);

  res.json({ ok: true, persona: { id, name: persona.name, nameKo: persona.nameKo, title: persona.title, titleKo: persona.titleKo } });
});

app.post("/api/read-file", (req, res) => {
  const { filePath } = req.body as { filePath: string };
  const resolved = path.resolve(PROJECT_DIR, filePath);
  if (!resolved.startsWith(PROJECT_DIR)) { res.status(403).json({ error: "Access denied" }); return; }
  if (!fs.existsSync(resolved)) { res.status(404).json({ error: "File not found" }); return; }
  res.json({ content: fs.readFileSync(resolved, "utf-8").slice(0, 50000) });
});

// Available providers
app.get("/api/providers", (_req, res) => {
  res.json([
    { id: "local", name: "Claude Code", model: "claude-code", envKey: "", available: claudeCliAvailable },
    { id: "anthropic", name: "Claude", model: PROVIDER_MODELS.anthropic, envKey: "ANTHROPIC_API_KEY" },
    { id: "openai", name: "GPT", model: PROVIDER_MODELS.openai, envKey: "OPENAI_API_KEY" },
    { id: "gemini", name: "Gemini", model: PROVIDER_MODELS.gemini, envKey: "GEMINI_API_KEY" },
  ]);
});

// Single persona chat
app.post("/api/chat", async (req, res) => {
  const { personaId, messages, lang = "en", provider = "anthropic" } = req.body as {
    personaId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
    provider?: Provider;
  };

  const persona = personas.get(personaId);
  if (!persona) { res.status(400).json({ error: "Unknown persona" }); return; }

  await streamChat(req, res, buildSystemPrompt(persona, lang), messages, provider);
});

// Group chat (dev personas)
app.post("/api/chat/group", async (req, res) => {
  const { messages, lang = "en", provider = "anthropic" } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
    provider?: Provider;
  };

  await streamChat(req, res, buildGroupSystemPrompt(lang, "dev"), messages, provider);
});

// Biz group chat (active biz personas)
app.post("/api/chat/biz-group", async (req, res) => {
  const { messages, lang = "en", provider = "anthropic", activeIds = [] } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
    provider?: Provider;
    activeIds?: string[];
  };

  await streamChat(req, res, buildGroupSystemPrompt(lang, "biz", activeIds), messages, provider);
});

async function findAvailablePort(start: number): Promise<number> {
  const net = await import("net");
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(start, () => {
      server.close(() => resolve(start));
    });
    server.on("error", () => {
      resolve(findAvailablePort(start + 1));
    });
  });
}

const preferredPort = parseInt(process.env.PORT || "3456", 10);
findAvailablePort(preferredPort).then((port) => {
  app.listen(port, () => {
    console.log(`  Savant Chat -> http://localhost:${port}\n`);
  });
});
