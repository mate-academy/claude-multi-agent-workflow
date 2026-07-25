# NOTES

## What this plugin does

`code-reviewer` is a code-quality plugin built and tested against `course-api`, a small Express API. It bundles:

- **`code-reviewer` subagent** — read-only. Reviews a file or diff against this repo's own conventions (`course-api/CLAUDE.md`: one route file per resource, validation → `400`, missing record → `404`, `{ "error": "message" }` error shape) and reports findings without editing anything.
- **`test-writer` subagent** — write/edit. Writes or extends tests under `course-api/tests/` following the existing `node:test` + `supertest` pattern, and runs `npm test` to confirm they pass.
- **`/audit` command** — orchestrates both subagents: reviews route files in parallel, then hands the coverage gaps it finds to `test-writer` in a dependent second stage.
- **`route-conventions` skill** — loaded when adding or changing a route, so new code matches the existing pattern instead of drifting.
- **`hooks/hooks.json` + `format-fix.js`** — a `PostToolUse` hook that runs the target project's own local ESLint with `--fix` after any `.js` edit, and surfaces any errors it can't auto-fix back to Claude.

## Install

This repo is both the plugin and the marketplace that offers it.

**As a user, from a fresh Claude Code session:**
```
/plugin marketplace add robertomumo/claude-multi-agent-workflow
/plugin install code-reviewer@robertomumo-plugins
```

**For local development**, from the repo root:
```
claude --plugin-dir .
```
Use `/reload-plugins` to pick up edits without restarting the session.

## Scoping decision: why `code-reviewer` and `test-writer` differ

`code-reviewer` gets `Read, Grep, Glob` only, and `model: opus`. It never touches a file — its whole job is judgment: is this validation missing, is this status code wrong, does this diverge from the pattern in a sibling route. That's exactly the kind of nuanced, security-and-correctness-adjacent call that benefits from a stronger model, and there's no reason to hand it write access it will never use — giving a read-only reviewer `Edit` would just widen its blast radius for no benefit.

`test-writer` gets `Read, Write, Edit, Grep, Glob, Bash`, and `model: sonnet`. It has to create/modify test files and run `npm test` (hence `Bash`), so it genuinely needs write access — but its actual task, matching an established test pattern already demonstrated in `tests/users.test.js`, is far more mechanical than open-ended review judgment, so the cheaper model is the right fit. Its prompt also explicitly forbids editing anything under `routes/` or `db/`: if the source looks wrong, it reports that instead of quietly patching around it, so `test-writer` can't paper over a bug `code-reviewer` should have caught.

## Orchestration decision: why `/audit` is parallel then sequential

Stage 1 launches one `code-reviewer` call per route file, all in a single batch. These reviews don't depend on each other — reviewing `users.js` doesn't need anything learned from reviewing `health.js` — so running them one at a time would just be slower for no correctness benefit.

Stage 2 launches a single `test-writer` call, but only after every Stage 1 review has returned. This one genuinely has to be sequential: `test-writer` needs the *combined* list of coverage gaps across all reviewed files as its input, so starting it before Stage 1 finishes would mean working from incomplete information (or missing a gap entirely, like `health.js` having no test file at all).
