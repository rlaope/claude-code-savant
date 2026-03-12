import express from "express";

export interface CachedResponse {
  id: string;
  text: string;
  usage: { input_tokens?: number; output_tokens?: number } | null;
  done: boolean;
  error?: string;
  listeners: Set<express.Response>;
  createdAt: number;
}

export const responseCache = new Map<string, CachedResponse>();
export let responseIdCounter = 0;

export function incrementResponseIdCounter(): number {
  return ++responseIdCounter;
}

// Clean up old cached responses (older than 10 min)
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [id, cached] of responseCache) {
    if (cached.done && cached.createdAt < cutoff) responseCache.delete(id);
  }
}, 60_000);

export function createCachedWriter(cached: CachedResponse): express.Response {
  return {
    write(chunk: string) {
      if (typeof chunk === "string" && chunk.startsWith("data: ")) {
        const data = chunk.slice(6).trim();
        if (data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) cached.text += parsed.text;
            if (parsed.usage) cached.usage = { ...cached.usage, ...parsed.usage };
            if (parsed.error) cached.error = parsed.error;
          } catch {}
        }
      }
      for (const listener of cached.listeners) {
        try {
          listener.write(chunk);
          if (typeof (listener as any).flush === "function") (listener as any).flush();
        } catch { cached.listeners.delete(listener); }
      }
      return true;
    },
  } as any;
}
