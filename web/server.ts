import express from "express";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

import { Provider, PersonaInfo, PersonaCategory } from "./types.js";
import {
  PROVIDER_MODELS,
  getApiKey,
  formatApiError,
  streamAnthropic,
  streamOpenAI,
  streamGemini,
  streamLocal,
} from "./providers.js";
import {
  CachedResponse,
  responseCache,
  incrementResponseIdCounter,
  createCachedWriter,
} from "./response-cache.js";
import {
  DEV_META,
  BIZ_META,
  loadPersonas,
  loadMetaOverrides,
  saveMetaOverrides,
  applyOverrides,
} from "./personas.js";
import { scanProject, scanProjectLight } from "./project-scanner.js";
import { PersonaMeta } from "./types.js";

// Find claude CLI path
function findClaudeCli(): string | null {
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

// ── Persona Loading ───────────────────────────────────────────────
const META_OVERRIDES_PATH = path.join(PERSONAS_DIR, "meta-overrides.json");
const metaOverrides = loadMetaOverrides(META_OVERRIDES_PATH);
const personas = loadPersonas(PERSONAS_DIR, metaOverrides);

let projectContext = scanProject(PROJECT_DIR);
let projectContextLight = scanProjectLight(PROJECT_DIR);

console.log(`\n  Project: ${path.basename(PROJECT_DIR)}`);
console.log(`  Context: ${(projectContext.length / 1024).toFixed(1)}KB`);
console.log(`  Claude CLI: ${claudeCliAvailable ? "available (default provider)" : "not found"}\n`);

// ── System Prompt Builders ────────────────────────────────────────
function buildSystemPrompt(persona: PersonaInfo, lang: string, mode: string = "deep"): string {
  const langInstruction = lang === "ko"
    ? "IMPORTANT: You MUST respond in Korean (한국어). Always use Korean regardless of the user's language."
    : "IMPORTANT: Respond in English.";

  const prompt = mode === "fast" ? persona.lightSystemPrompt : persona.systemPrompt;
  const context = mode === "fast" ? projectContextLight : projectContext;

  return `${prompt}

---

## Your Role in This Chat

You are a conversational AI assistant embodying the ${persona.name} persona. You are helping a developer who is working on the project described below. You deeply understand this project's codebase, architecture, and conventions.

Respond conversationally while staying in character. Be helpful, specific, and reference actual files/code from the project when relevant.

${langInstruction}

${context}`;
}

function buildGroupSystemPrompt(lang: string, category: PersonaCategory = "dev", activeIds?: string[], mode: string = "deep"): string {
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

  const context = mode === "fast" ? projectContextLight : projectContext;

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

${context}`;
}

// ── streamChat ────────────────────────────────────────────────────
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
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const responseId = `r_${incrementResponseIdCounter()}_${Date.now()}`;
  const cached: CachedResponse = {
    id: responseId,
    text: "",
    usage: null,
    done: false,
    listeners: new Set([res]),
    createdAt: Date.now(),
  };
  responseCache.set(responseId, cached);

  res.write(`data: ${JSON.stringify({ responseId })}\n\n`);
  // Don't eagerly remove listeners on close — let the writer's try/catch handle disconnected clients

  const writer = createCachedWriter(cached);

  try {
    if (provider === "local") {
      if (!claudeCliAvailable) throw new Error("Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code");
      await streamLocal(claudeCliPath!, systemPrompt, messages, writer);
    } else {
      const apiKey = getApiKey(provider, req);
      if (provider === "openai") await streamOpenAI(apiKey, systemPrompt, messages, writer);
      else if (provider === "gemini") await streamGemini(apiKey, systemPrompt, messages, writer);
      else await streamAnthropic(apiKey, systemPrompt, messages, writer);
    }

    cached.done = true;
    for (const listener of cached.listeners) {
      try { listener.write("data: [DONE]\n\n"); listener.end(); } catch {}
    }
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    const message = formatApiError(raw);
    cached.error = message;
    cached.done = true;
    for (const listener of cached.listeners) {
      try { listener.write(`data: ${JSON.stringify({ error: message })}\n\n`); listener.end(); } catch {}
    }
  }
}

// ── Response Resume API ──────────────────────────────────────────
app.get("/api/response/:id", (req, res) => {
  const cached = responseCache.get(req.params.id);
  if (!cached) { res.json({ found: false }); return; }
  res.json({ found: true, text: cached.text, usage: cached.usage, done: cached.done, error: cached.error });
});

app.get("/api/response/:id/stream", (req, res) => {
  const cached = responseCache.get(req.params.id);
  if (!cached) {
    res.status(404).json({ error: "Response not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  if (cached.text) res.write(`data: ${JSON.stringify({ text: cached.text, cached: true })}\n\n`);
  if (cached.usage) res.write(`data: ${JSON.stringify({ usage: cached.usage })}\n\n`);

  if (cached.done) {
    if (cached.error) res.write(`data: ${JSON.stringify({ error: cached.error })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  cached.listeners.add(res);
  // Writer's try/catch handles disconnected clients
});

// ── API Routes ───────────────────────────────────────────────────
app.get("/api/project", (_req, res) => {
  res.json({ name: path.basename(PROJECT_DIR), path: PROJECT_DIR });
});

app.get("/api/project/context", (_req, res) => {
  res.json({ context: projectContext });
});

app.post("/api/project/context/refresh", (_req, res) => {
  projectContext = scanProject(PROJECT_DIR);
  projectContextLight = scanProjectLight(PROJECT_DIR);
  res.json({ ok: true, size: projectContext.length });
});

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

app.put("/api/persona/:id/meta", (req, res) => {
  const { id } = req.params;
  const updates = req.body as Partial<PersonaMeta>;

  if (!personas.has(id)) {
    res.status(404).json({ error: "Unknown persona" });
    return;
  }

  const persona = personas.get(id)!;
  if (updates.name !== undefined) persona.name = updates.name;
  if (updates.nameKo !== undefined) persona.nameKo = updates.nameKo;
  if (updates.title !== undefined) persona.title = updates.title;
  if (updates.titleKo !== undefined) persona.titleKo = updates.titleKo;

  metaOverrides[id] = { ...metaOverrides[id], ...updates };
  saveMetaOverrides(META_OVERRIDES_PATH, metaOverrides);

  res.json({ ok: true, persona: { id, name: persona.name, nameKo: persona.nameKo, title: persona.title, titleKo: persona.titleKo } });
});

app.post("/api/read-file", (req, res) => {
  const { filePath } = req.body as { filePath: string };
  const resolved = path.resolve(PROJECT_DIR, filePath);
  if (!resolved.startsWith(PROJECT_DIR)) { res.status(403).json({ error: "Access denied" }); return; }
  if (!fs.existsSync(resolved)) { res.status(404).json({ error: "File not found" }); return; }
  res.json({ content: fs.readFileSync(resolved, "utf-8").slice(0, 50000) });
});

app.get("/api/providers", (_req, res) => {
  res.json([
    { id: "local", name: "Claude Code", model: "claude-code", envKey: "", available: claudeCliAvailable },
    { id: "anthropic", name: "Claude", model: PROVIDER_MODELS.anthropic, envKey: "ANTHROPIC_API_KEY" },
    { id: "openai", name: "GPT", model: PROVIDER_MODELS.openai, envKey: "OPENAI_API_KEY" },
    { id: "gemini", name: "Gemini", model: PROVIDER_MODELS.gemini, envKey: "GEMINI_API_KEY" },
  ]);
});

app.post("/api/chat", async (req, res) => {
  const { personaId, messages, lang = "en", provider = "anthropic", mode = "deep" } = req.body as {
    personaId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
    provider?: Provider;
    mode?: string;
  };

  const persona = personas.get(personaId);
  if (!persona) { res.status(400).json({ error: "Unknown persona" }); return; }

  await streamChat(req, res, buildSystemPrompt(persona, lang, mode), messages, provider);
});

app.post("/api/chat/group", async (req, res) => {
  const { messages, lang = "en", provider = "anthropic", mode = "deep" } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
    provider?: Provider;
    mode?: string;
  };

  await streamChat(req, res, buildGroupSystemPrompt(lang, "dev", undefined, mode), messages, provider);
});

app.post("/api/chat/biz-group", async (req, res) => {
  const { messages, lang = "en", provider = "anthropic", activeIds = [], mode = "deep" } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
    provider?: Provider;
    activeIds?: string[];
    mode?: string;
  };

  await streamChat(req, res, buildGroupSystemPrompt(lang, "biz", activeIds, mode), messages, provider);
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
