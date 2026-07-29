# code-quality-kit

A Claude Code plugin that reviews code and keeps regression test coverage in sync, for small Node/Express services like the `course-api/` app bundled in this repo. This repo is both the plugin and the marketplace that serves it.

## What's in the plugin

- **`agents/code-reviewer.md`** — read-only subagent (`Read`, `Grep`, `Glob`) that reviews changed files for correctness bugs and convention violations. Never edits anything.
- **`agents/test-writer.md`** — writing subagent (`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`) that adds or updates regression tests for changed behavior and runs `npm test` to confirm.
- **`commands/quality-check.md`** — the `/quality-check` workflow: dispatches `code-reviewer` and `test-writer` in parallel, then produces one combined report once both return.
- **`skills/code-quality-checklist/SKILL.md`** — the project's own conventions (validation, error shape, test pattern) written down once so both agents apply the same bar.
- **`hooks/hooks.json`** + **`hooks/scripts/lint-on-save.js`** — a `PostToolUse` hook that lints a `.js` file with the nearest ESLint config right after Claude edits or writes it.

See `NOTES.md` for the scoping and orchestration decisions behind this design.

## Install

From a fresh Claude Code session:

```
/plugin marketplace add <this-repo>
/plugin install code-quality-kit@claude-multi-agent-workflow
```

Or, to test locally against a checkout of this repo without publishing anything:

```
claude --plugin-dir .
```

Then run `/quality-check` from the repo root (with `course-api/` present) to try the workflow end-to-end. Use `/reload-plugins` after editing any plugin file.

## Test fixture

`course-api/` is the sample Express API this plugin is built and tested against — see `course-api/README.md` and `course-api/CLAUDE.md` for how to run it.
