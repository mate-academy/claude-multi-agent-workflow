# api-quality-guard

A Claude Code plugin that bundles a code-review and test-coverage workflow for Express APIs. Built and tested against the Express API in `course-api/`.

## Structure

- `.claude-plugin/plugin.json` — plugin manifest (name, version).
- `agents/` — scoped subagents (e.g. a read-only reviewer, a test writer).
- `commands/` — the workflow command that orchestrates the subagents.
- `skills/` — supporting skills for the plugin's theme.
- `hooks/` — hooks that fire around plugin/tool events.

## Install

```
claude --plugin-dir .
```

Then use `/reload-plugins` after making edits.

## Status

Scaffolding in progress — subagents, workflow command, skill, and hook are being added incrementally.
