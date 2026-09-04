# code-quality

A Claude Code plugin that reviews and fixes code quality issues in an Express API, then reports what it did. Built and tested against the `course-api/` project in this repo.

## What it does

- **`code-reviewer`** (subagent, read-only) — reads routes, `db/store.js`, and tests, and reports convention violations and bugs against the project's own `CLAUDE.md` (missing `400`/`404` handling, wrong error shape, state held outside `db/store.js`, unused vars, logic bugs). Never edits anything.
- **`quality-fixer`** (subagent, read-write) — takes a list of findings, applies the smallest correct edit for each, adds a regression test where one's missing, and re-runs `npm run lint` / `npm test` to confirm the fix actually holds.
- **`/code-quality:code-quality`** (command) — orchestrates the two subagents as a workflow: two `code-reviewer` runs in parallel over disjoint parts of the codebase, then one `quality-fixer` run that depends on both finishing.
- **`api-conventions`** (skill) — surfaces the project's house rules (validation, status codes, error shape, state ownership) whenever Claude is writing or editing course-api code directly.
- **`hooks.json`** (hook) — a `PostToolUse` hook that runs ESLint `--fix` on any `.js` file touched by an `Edit`/`Write`, and reports back anything it couldn't auto-fix.

## Install

**Via marketplace**, from a fresh Claude Code session:

```
/plugin marketplace add RFrams/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

**Locally**, for development — from a checkout of this repo:

```
claude --plugin-dir .
```

Either way, components load under the `code-quality:` namespace.

## Usage

Run the full workflow against `course-api/`:

```
/code-quality:code-quality
```

Or call a subagent directly for a narrower job:

```
Use the code-quality:code-reviewer subagent to review course-api/routes/users.js
Use the code-quality:quality-fixer subagent to add a missing test for the 404 case in PUT /users/:id
```

The `api-conventions` skill and the lint hook fire on their own — the skill when Claude is about to touch course-api code, the hook after every `Edit`/`Write` to a `.js` file inside it. No need to invoke either by name.

See [`NOTES.md`](./NOTES.md) for the scoping and orchestration decisions behind the design.
