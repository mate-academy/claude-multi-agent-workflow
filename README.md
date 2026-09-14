# code-quality

A Claude Code plugin that bundles a small, orchestrated code-quality workflow: scoped
subagents for reviewing and fixing code, a command that runs them together, a skill
that encodes this repo's conventions, and a hook that keeps edits linted.

Built and tested against the Express API in [`course-api/`](course-api/).

## Structure

- `.claude-plugin/plugin.json` — plugin manifest (name, version)
- `.claude-plugin/marketplace.json` — marketplace catalog listing this plugin
- `agents/` — scoped subagents (a read-only reviewer, a fixer that edits code)
- `commands/` — the workflow command that orchestrates the subagents
- `skills/` — a skill covering this project's code conventions
- `hooks/` — a hook that lints files after they're written or edited
- `course-api/` — the sample Express API this plugin is built and tested against
- `NOTES.md` — install steps and the reasoning behind key scoping/orchestration decisions

## Install

From a Claude Code session:

```
/plugin marketplace add <this-repo>
/plugin install code-quality@<marketplace-name>
```

Or, for local development, run Claude Code from the repo root with:

```
claude --plugin-dir .
```

## Status

Scaffolding in progress — see `NOTES.md` for the current state of each component.
