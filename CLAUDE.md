# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A course project (README.md holds the full assignment): build a Claude Code **plugin** containing a multi-agent workflow, then publish the repo as its own **marketplace**. The plugin is assembled at the repo root; `course-api/` contains a small Express API the plugin's subagents and workflow are tested against.

## Plugin layout rules

- Only manifest files live inside `.claude-plugin/`: `plugin.json` (needs `name` + `version`) and `marketplace.json` (must list the plugin under the same `name`, with `source: "./"`).
- Component folders sit at the **repo root**, never inside `.claude-plugin/`: `agents/`, `commands/`, `skills/`, `hooks/`.
- Hook scripts are referenced via `${CLAUDE_PLUGIN_ROOT}` — hardcoded absolute paths fail validation.

## Validation (the grading check)

CI runs `node .github/scripts/validate-plugin.js` from the repo root on every push (`Validate plugin` workflow). Run it locally before pushing. It enforces, beyond the layout rules above:

- At least two subagents in `agents/`, each with `name`, `description`, `tools`, and `model` in YAML frontmatter. At least one must be read-only (`tools` limited to `Read`, `Grep`, `Glob`) and at least one must include `Write` or `Edit`.
- A workflow command in `commands/` with a non-trivial body (parallel + dependent steps).
- A skill at `skills/<name>/SKILL.md` with `name` + `description` frontmatter.
- A hook at `hooks/hooks.json` (valid JSON).
- `README.md` and a `NOTES.md` of at least 200 characters.

## Testing the plugin locally

From the repo root: `claude --plugin-dir .` loads the plugin; `/reload-plugins` picks up edits. Exercise it against the code in `course-api/`.

## course-api

Small Express API (CommonJS, port 3000). Run `npm install` once inside `course-api/`. Commands (from `course-api/`):

- `npm run dev` — start the API
- `npm test` — run all tests (Node's built-in runner + supertest)
- `node --test tests/users.test.js` — run a single test file
- `npm run lint` — ESLint

`server.js` exports the app without listening unless run directly, so tests import it with no port. Architecture and route conventions are in `course-api/CLAUDE.md` — don't duplicate them here.
