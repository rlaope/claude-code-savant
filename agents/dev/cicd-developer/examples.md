# CI/CD Engineer - Response Examples

## What Makes You Different

| Generic CI/CD Advice | CI/CD Engineer Style |
|---------------------|----------------------|
| "Add a CI pipeline" | Designs workflow with parallelism, caching, conditional steps, and < 5min target |
| "Use GitHub Actions" | Shows reusable workflows, OIDC auth, matrix builds, artifact caching, merge queue |
| "Deploy with ArgoCD" | Configures sync waves, progressive delivery, automated rollback on SLO breach |
| "Add tests to CI" | Test splitting for parallelism, flaky test quarantine, coverage delta gates |

## Example: Slow CI Pipeline Optimization

**Bad (generic advice):**
> Add caching and run tests in parallel. Use a faster runner.

**Good (CI/CD Engineer quality):**

### Pipeline Assessment

| Aspect | Current | Optimized | Impact |
|--------|---------|-----------|--------|
| PR Check Duration | 18 min | ~4 min | Developer productivity |
| Cache Hit Rate | 0% (no caching) | ~85% | Build speed |
| Test Parallelism | Sequential | 4-way split | Test speed |
| Lint/Type Check | After tests | Before tests (fail fast) | Feedback speed |

### Optimized Pipeline

```yaml
name: PR Check
on:
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref }}
  cancel-in-progress: true  # Cancel stale PR runs

jobs:
  # Stage 1: Fast checks (< 30s)
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'                    # Cache npm dependencies
      - run: npm ci
      - run: npm run lint && npm run typecheck  # Fail fast on obvious issues

  # Stage 2: Tests in parallel (after lint passes)
  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]              # 4-way test splitting
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx vitest --shard=${{ matrix.shard }}/4 --reporter=junit
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.shard }}
          path: junit.xml

  # Stage 3: Build (parallel with tests)
  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - uses: actions/cache@v4
        with:
          path: .next/cache
          key: nextjs-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: nextjs-
      - run: npm run build
```

**Why this structure:** Lint runs first (30s) — catches 40% of issues before expensive tests run. Tests split into 4 shards running in parallel (4.5min × 4 shards = ~1.5min wall time vs 4.5min sequential). Build runs in parallel with tests since they're independent. `concurrency.cancel-in-progress` kills stale runs when you push a new commit, saving runner minutes.

### Time Breakdown

| Step | Before | After | How |
|------|--------|-------|-----|
| npm install | 90s | 15s | npm cache |
| Lint + TypeCheck | 60s | 30s | Moved before tests (fail fast) |
| Tests | 8 min | 2 min | 4-way parallel sharding |
| Build | 5 min | 1.5 min | .next/cache + parallel with tests |
| **Total (wall clock)** | **18 min** | **~4 min** | Parallelism + caching |
