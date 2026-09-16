# NOTES — api-guard

## What it does

`api-guard` is a code-quality plugin scoped to `course-api/`, the Express users API in this repo. It bundles:

- **`agents/api-reviewer.md`** — a read-only subagent that checks route/store code against the conventions in `course-api/CLAUDE.md` and flags drift between `course-api/docs/api.md` and the live routes.
- **`agents/test-writer.md`** — a subagent that adds or updates `node:test`/`supertest` cases in `course-api/tests/` to cover gaps, and verifies them by running `npm test` itself.
- **`commands/api-check.md`** — the `/api-check` workflow command that orchestrates both subagents (see orchestration decision below).
- **`skills/api-conventions/SKILL.md`** — the shared checklist both subagents load via their `skills:` frontmatter, so review and test-writing use the same definition of "correct".
- **`hooks/hooks.json`** — a `PostToolUse` hook that runs `npm run lint` automatically whenever a `.js` file under `course-api/` is edited, surfacing violations immediately instead of waiting for a manual check.

## How to install

From a fresh Claude Code session:

```
/plugin marketplace add <this-repo>
/plugin install api-guard@api-guard-marketplace
```

Or for local development, run `claude --plugin-dir .` from the repo root and use `/reload-plugins` while iterating.

Once installed, run `/api-check` to review `course-api/` and fill any test gaps in one pass.

## Scoping decision: why the two agents differ

`api-reviewer` is scoped to `tools: Read, Grep, Glob` and `model: haiku`. Reviewing is a bounded pattern-matching task — checking existing code against a fixed checklist (status codes, error shape, store-only access) — so it doesn't need the ability to change anything, and a cheaper/faster model is enough to do it reliably. Keeping it read-only also means running it is inherently safe to fire off speculatively (e.g. twice in parallel per commit, as `/api-check` does) without any risk of it touching files.

`test-writer` is scoped to `tools: Read, Write, Edit, Grep, Glob, Bash` and `model: sonnet`. Writing correct tests is a generative task — it has to understand existing test patterns, produce new code that compiles and asserts the right things, and then actually verify its own output, which is why it also gets `Bash` (to run `npm test` itself rather than asserting success on faith). That's a harder job than pattern-matching against a checklist, so it gets the stronger model.

## Orchestration decision: why `/api-check` has a parallel step and a dependent step

Step 1 dispatches two `api-reviewer` calls in parallel because they're genuinely independent work over different inputs: one scans the route/store code for convention violations, the other compares the docs against the code for drift. Neither call's output depends on the other, so running them in the same turn is strictly faster than running them one after another, with no loss of correctness.

Step 2 is dependent on Step 1 by necessity: `test-writer` needs to know what gaps were found before it can decide what to write tests for. Running it before the reviews finish would mean guessing at what to cover instead of targeting the actual findings, so it has to wait for both Step 1 calls to complete and merge their results first.
