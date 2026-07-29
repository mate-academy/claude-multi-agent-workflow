# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This repo is **both a Claude Code plugin under construction and the marketplace that serves it**. The end result must bundle:

- two scoped subagents (`agents/`) — at least one read-only, at least one that can write/edit
- a workflow command (`commands/`) that orchestrates those subagents with at least one parallel step and one dependent step
- a skill (`skills/<name>/SKILL.md`)
- a hook (`hooks/hooks.json`)
- a manifest (`.claude-plugin/plugin.json`) and marketplace catalog (`.claude-plugin/marketplace.json`)
- `README.md` and `NOTES.md`

`course-api/` is the sample Express app included so the plugin's subagents/workflow have real code to operate on (review it, run its tests, etc.) — it is a test fixture, not the thing being built. It has its own `CLAUDE.md`; read that when working inside `course-api/`.

## Commands

- Validate plugin structure (what CI runs): `node .github/scripts/validate-plugin.js` from the repo root
- Load the plugin locally: `claude --plugin-dir .` from the repo root; use `/reload-plugins` after edits
- Inside `course-api/`: `npm install` once, then `npm run dev` / `npm test` / `npm run lint` (see `course-api/CLAUDE.md`)

## Plugin structure rules (enforced by `.github/scripts/validate-plugin.js`, run in CI via `.github/workflows/validate.yml`)

- Only `plugin.json` (and `marketplace.json`) live inside `.claude-plugin/` — `commands/`, `agents/`, `skills/`, `hooks/` must sit at the repo root, never nested under `.claude-plugin/`.
- Every file in `agents/*.md` needs YAML frontmatter with `name`, `description`, `tools`, and `model`. Across all agents, at least one must be read-only (`tools` limited to `Read`/`Grep`/`Glob`) and at least one must include `Write` or `Edit`.
- `commands/` needs at least one non-trivial command file (the validator rejects near-empty files).
- The skill lives at `skills/<name>/SKILL.md` with frontmatter `name` + `description`.
- `hooks/hooks.json` must be valid JSON with no hardcoded absolute paths (no `/Users/...`, `/home/...`, etc.) — reference bundled scripts via `${CLAUDE_PLUGIN_ROOT}`.
- `.claude-plugin/marketplace.json` must list a plugin entry whose `name` matches `plugin.json`'s `name`, with a `source`.
- `NOTES.md` must be present and substantive (200+ chars): what the plugin does/how to install it, one scoping decision (why an agent got the tools/model it did), one orchestration decision (why a step runs parallel vs. sequential).

When adding or editing plugin components, check this validator's expectations directly (`.github/scripts/validate-plugin.js`) rather than guessing the schema — it's the actual grading logic.
