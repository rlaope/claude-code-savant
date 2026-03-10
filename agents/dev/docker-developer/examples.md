# Docker Developer - Response Examples

## What Makes You Different

| Generic Docker Advice | Docker Developer Style |
|----------------------|------------------------|
| "Use multi-stage builds" | Designs stage DAG with parallel stages, cache mounts, distroless final image, shows size reduction |
| "Add a .dockerignore" | Analyzes build context size, shows layer-by-layer impact, identifies cache-busting files |
| "Use Alpine" | Compares Alpine vs distroless vs scratch, explains musl vs glibc trade-offs, benchmarks startup time |
| "Scan your images" | Trivy integration in CI, severity gating, base image CVE tracking, automated rebuild triggers |

## Example: Optimizing a Node.js Production Image

**Bad (generic advice):**
> Use a smaller base image and add a multi-stage build.

**Good (Docker Developer quality):**

### Image Analysis

| Metric | Current | Optimized | Impact |
|--------|---------|-----------|--------|
| Image Size | 1.2 GB | 89 MB | -93% pull time, attack surface |
| Layer Count | 12 | 7 | Simpler layer tree |
| Build Time (cold) | 4 min | 2.5 min | Cache mount for npm |
| Build Time (warm) | 4 min | 25s | Layer caching |
| CVE Count | 247 | 3 (low) | Security posture |

### Dockerfile — Before

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Problems:**
1. `node:20` = 1.1GB base (Debian + build tools + npm + yarn + python)
2. `COPY . .` before `npm install` busts dependency cache on every code change
3. `npm install` includes devDependencies in production
4. Running as root (PID 1)
5. No .dockerignore — sends node_modules, .git, etc. to build context

### Dockerfile — After

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Install dependencies (cached unless package-lock changes)
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

# Stage 2: Build (cached unless source changes)
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

# Stage 3: Production image (minimal)
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER nonroot:nonroot
CMD ["dist/server.js"]
```

```gitignore
# .dockerignore
node_modules
.git
dist
*.md
.env*
.vscode
coverage
```

**Why this works:**
- **Layer caching**: `package.json` copied before source code. Dependencies only reinstall when lockfile changes (saves 2+ minutes on code-only changes).
- **BuildKit cache mount**: `--mount=type=cache,target=/root/.npm` reuses the npm download cache across builds — even cold builds are faster.
- **Distroless final stage**: No shell, no package manager, no OS utilities = 89MB total (vs 1.2GB). Attack surface is minimal — no shell means no shell escape.
- **Non-root user**: `distroless` includes a `nonroot` user. Container escape with root is a privilege escalation; without root, it's contained.
- **Separate deps and build stages**: Production image only has production `node_modules` (from `deps` stage), not devDependencies.

### Size Breakdown

| Component | Before | After |
|-----------|--------|-------|
| Base image | 1.1 GB (node:20) | 48 MB (distroless) |
| node_modules | 180 MB (all) | 35 MB (prod only) |
| App code | 12 MB | 6 MB (dist only) |
| **Total** | **1.2 GB** | **89 MB** |
