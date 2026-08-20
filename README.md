# code-quality

A Claude Code plugin that runs a two-agent code-quality workflow against an Express API: review changes, then fix issues and add missing test coverage. This repository is both the plugin and the marketplace that offers it.

## What's inside

- **Subagents** (`agents/`)
  - `code-reviewer` — read-only. Reviews routes for bugs, missing validation, and convention violations.
  - `test-writer` — reads, writes, and runs tests. Fixes issues and adds coverage, then verifies with `npm test` / `npm run lint`.
- **Workflow command** (`commands/ship-check.md`) — `/code-quality:ship-check` runs the reviewer and the test/lint baseline in parallel, then hands the combined findings to `test-writer` as a dependent step.
- **Skill** (`skills/api-conventions/SKILL.md`) — summarizes the target API's routing, validation, and error-shape conventions so both agents stay consistent with the codebase.
- **Hook** (`hooks/hooks.json`) — after every `Edit`/`Write`, lints the touched file if it's part of `course-api/`.

## Install

From a fresh Claude Code session:

```
/plugin marketplace add MarinaKramarchuk/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

Or, testing locally from a clone of this repo:

```
claude --plugin-dir .
```

## Try it

The plugin is built and tested against `course-api/`, the small Express API included in this repo:

```
cd course-api && npm install
```

Then, in a Claude Code session with the plugin loaded, run:

```
/code-quality:ship-check
```

Use `/reload-plugins` after editing any plugin file to pick up the change.

See `NOTES.md` for the scoping and orchestration decisions behind this plugin.
