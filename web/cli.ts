#!/usr/bin/env node

/**
 * CLI entry point for savant-chat
 * Usage: npx savant-chat
 *        savant-chat
 *        savant-chat --port 4000
 */

import { execSync, spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
let port = "3456";

for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) {
    port = args[i + 1];
    i++;
  }
}

const serverPath = path.join(__dirname, "dist", "server.js");
const projectDir = process.cwd();

console.log("");
console.log("  ┌─────────────────────────────────┐");
console.log("  │        Savant Chat               │");
console.log("  │  AI Personas for Your Project    │");
console.log("  └─────────────────────────────────┘");
console.log("");

const child = spawn("node", [serverPath], {
  env: {
    ...process.env,
    PROJECT_DIR: projectDir,
    PORT: port,
  },
  stdio: ["inherit", "pipe", "inherit"],
});

// Detect actual port from server output and open browser
let opened = false;
child.stdout?.on("data", (data: Buffer) => {
  const text = data.toString();
  process.stdout.write(text);

  if (!opened) {
    const match = text.match(/localhost:(\d+)/);
    if (match) {
      opened = true;
      const actualPort = match[1];
      const url = `http://localhost:${actualPort}`;
      setTimeout(() => {
        try {
          if (process.platform === "darwin") execSync(`open ${url}`);
          else if (process.platform === "linux") execSync(`xdg-open ${url}`);
          else if (process.platform === "win32") execSync(`start ${url}`);
        } catch { /* ignore */ }
      }, 500);
    }
  }
});

child.on("exit", (code) => process.exit(code || 0));
process.on("SIGINT", () => { child.kill("SIGINT"); process.exit(0); });
process.on("SIGTERM", () => { child.kill("SIGTERM"); process.exit(0); });
