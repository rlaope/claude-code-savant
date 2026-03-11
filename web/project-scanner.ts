import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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

export function scanProject(dir: string): string {
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
    lines.push(fs.readFileSync(readmePath, "utf-8").slice(0, 5000));
  }

  const claudeMdPath = path.join(dir, "CLAUDE.md");
  if (fs.existsSync(claudeMdPath)) {
    lines.push(`\n## CLAUDE.md (Project Instructions)`);
    lines.push(fs.readFileSync(claudeMdPath, "utf-8").slice(0, 5000));
  }

  const agentsMdPath = path.join(dir, "AGENTS.md");
  if (fs.existsSync(agentsMdPath)) {
    lines.push(`\n## AGENTS.md (Agent Instructions)`);
    lines.push(fs.readFileSync(agentsMdPath, "utf-8").slice(0, 3000));
  }

  const envExamplePath = path.join(dir, ".env.example");
  if (fs.existsSync(envExamplePath)) {
    lines.push(`\n## Environment Variables (.env.example)`);
    lines.push("```\n" + fs.readFileSync(envExamplePath, "utf-8").slice(0, 1000) + "\n```");
  }

  lines.push(`\n## Directory Structure\n\`\`\``);
  try { lines.push(buildTree(dir, 3)); } catch { lines.push("(could not read)"); }
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
      const sourceFiles = collectFiles(sdPath, 3).slice(0, 30);
      for (const f of sourceFiles) {
        lines.push(`- \`${path.relative(dir, f)}\` (${fs.statSync(f).size} bytes)`);
      }
      const codeExts = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".vue", ".svelte"]);
      const topFiles = sourceFiles.filter(f => codeExts.has(path.extname(f))).slice(0, 5);
      for (const f of topFiles) {
        try {
          const content = fs.readFileSync(f, "utf-8").split("\n").slice(0, 80).join("\n");
          lines.push(`\n### \`${path.relative(dir, f)}\` (preview)\n\`\`\`\n${content}\n\`\`\``);
        } catch { /* skip unreadable */ }
      }
    }
  }

  return lines.join("\n");
}

export function scanProjectLight(dir: string): string {
  const lines: string[] = [];
  lines.push(`# Project Context`);
  lines.push(`**Project Name**: \`${path.basename(dir)}\``);

  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      lines.push(`- **Name**: ${pkg.name || "unknown"}`);
      lines.push(`- **Version**: ${pkg.version || "unknown"}`);
      lines.push(`- **Description**: ${pkg.description || "none"}`);
    } catch { /* ignore */ }
  }

  lines.push(`\n## Directory Structure\n\`\`\``);
  try { lines.push(buildTree(dir, 2)); } catch { lines.push("(could not read)"); }
  lines.push("```");

  try {
    const branch = execSync("git branch --show-current", { cwd: dir, encoding: "utf-8" }).trim();
    lines.push(`\n- **Branch**: ${branch}`);
  } catch { /* not a git repo */ }

  return lines.join("\n");
}
