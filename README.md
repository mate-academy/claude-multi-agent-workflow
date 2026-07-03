# code-quality — a multi-agent code review plugin for Claude Code

One command runs a full quality pass on your codebase: two read-only reviewers inspect independent slices of the code **in parallel**, their findings are merged, and a test-writer agent then writes tests for every behavior the reviews found uncovered — and runs them to prove they pass. Tests that fail on purpose are kept and flagged: they document real bugs.

This repository is both the plugin and the marketplace that serves it.

## Install

```
/plugin marketplace add ZarkoA/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

## Usage

```
/code-quality:quality-check [path]
```

Runs the whole workflow on `path` (defaults to the project's source code) and ends with a single report: review verdict with `file:line` findings, the tests that were added, any real bugs the failing tests exposed, and a suggested next step.

The pieces also work standalone:

- **`code-quality:code-reviewer`** (agent) — read-only reviewer (`Read`, `Grep`, `Glob`); returns a verdict, prioritized findings, and test gaps. Fires on requests like "review this".
- **`code-quality:test-writer`** (agent) — writes tests in your project's existing style and runs the suite; touches test files only, never production code.
- **`code-quality:review-checklist`** (skill) — the shared severity rubric (critical/major/minor) and API review checklist both agents follow.
- **Lint-on-edit hook** (`PostToolUse`) — after Claude writes or edits a `.js`/`.mjs`/`.cjs` file, the nearest eslint-enabled package lints it; lint *errors* are fed back to Claude to fix immediately (warnings don't block, matching your project's own lint gate).

## Repository layout

- `.claude-plugin/` — `plugin.json` and `marketplace.json` (manifests only)
- `agents/`, `commands/`, `skills/`, `hooks/` — the plugin's components, at the repo root
- `course-api/` — a small Express API the plugin is developed and tested against
- `NOTES.md` — design notes: the scoping and orchestration decisions behind the plugin

## Developing

From the repo root:

```
claude --plugin-dir .        # load the plugin into a session
/reload-plugins              # pick up edits
node .github/scripts/validate-plugin.js   # structural validation (runs in CI on every push)
```

Exercise it against `course-api/` (`npm install` once inside, then `npm test` / `npm run dev`).
