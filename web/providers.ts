import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn } from "child_process";
import express from "express";
import { Provider } from "./types.js";

export const PROVIDER_MODELS: Record<Provider, string> = {
  local: "claude-code",
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  gemini: "gemini-2.0-flash",
};

export const PROVIDER_ENV_KEYS: Record<Provider, string> = {
  local: "",
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

export function getApiKey(provider: Provider, req?: express.Request): string {
  if (provider === "local") return "";
  const headerKey = req?.headers["x-api-key"] as string;
  const envKey = process.env[PROVIDER_ENV_KEYS[provider]];
  const key = headerKey || envKey;
  if (!key) throw new Error(`${PROVIDER_ENV_KEYS[provider]} not set`);
  return key;
}

export function formatApiError(raw: string): string {
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

export async function streamAnthropic(
  apiKey: string,
  systemPrompt: string,
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
    } else if (event.type === "message_delta" && (event as any).usage) {
      const u = (event as any).usage;
      res.write(`data: ${JSON.stringify({ usage: { output_tokens: u.output_tokens } })}\n\n`);
    }
  }
  const finalMsg = await stream.finalMessage();
  if (finalMsg.usage) {
    res.write(`data: ${JSON.stringify({ usage: { input_tokens: finalMsg.usage.input_tokens, output_tokens: finalMsg.usage.output_tokens } })}\n\n`);
  }
}

export async function streamOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  res: express.Response
): Promise<void> {
  const client = new OpenAI({ apiKey });
  const stream = await client.chat.completions.create({
    model: PROVIDER_MODELS.openai,
    max_tokens: 4096,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    if ((chunk as any).usage) {
      const u = (chunk as any).usage;
      res.write(`data: ${JSON.stringify({ usage: { input_tokens: u.prompt_tokens, output_tokens: u.completion_tokens } })}\n\n`);
    }
  }
}

export async function streamGemini(
  apiKey: string,
  systemPrompt: string,
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
    if ((chunk as any).usageMetadata) {
      const u = (chunk as any).usageMetadata;
      res.write(`data: ${JSON.stringify({ usage: { input_tokens: u.promptTokenCount, output_tokens: u.candidatesTokenCount } })}\n\n`);
    }
  }
}

export async function streamLocal(
  claudeCliPath: string,
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

    const proc = spawn(claudeCliPath, [
      "-p", userPrompt,
      "--system-prompt", systemPrompt,
      "--output-format", "json",
      "--max-turns", "3",
    ], {
      stdio: ["ignore", "pipe", "pipe"],
      env: cleanEnv,
    });
    console.error(`[claude-local] PID: ${proc.pid || "FAILED"}`);

    let stdout = "";

    const statusMessages = [
      { delay: 2000, msg: "Analyzing your question..." },
      { delay: 5000, msg: "Deep thinking..." },
      { delay: 10000, msg: "Generating response..." },
      { delay: 18000, msg: "Almost there..." },
    ];
    const statusTimers: NodeJS.Timeout[] = [];
    for (const s of statusMessages) {
      statusTimers.push(setTimeout(() => {
        res.write(`data: ${JSON.stringify({ status: s.msg })}\n\n`);
      }, s.delay));
    }

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const msg = chunk.toString().trim();
      if (msg) console.error(`[claude-local] ${msg}`);
    });

    proc.on("close", (code) => {
      console.error(`[claude-local] Process exited with code: ${code}`);
      for (const t of statusTimers) clearTimeout(t);
      res.write(`data: ${JSON.stringify({ status: "" })}\n\n`);
      try {
        const parsed = JSON.parse(stdout);
        const text = parsed.result || parsed.content || stdout;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if (parsed.usage) {
          res.write(`data: ${JSON.stringify({ usage: parsed.usage })}\n\n`);
        }
      } catch {
        if (stdout.trim()) res.write(`data: ${JSON.stringify({ text: stdout })}\n\n`);
      }
      resolve();
    });

    proc.on("error", (err) => {
      console.error(`[claude-local] Spawn error: ${err.message}`);
      reject(err);
    });
  });
}
