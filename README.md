# code-quality

A Claude Code plugin that bundles a code-quality workflow: two scoped subagents (a read-only reviewer and a code-editing fixer), a workflow command that orchestrates them, a skill, and a hook — tested against the Express API in `course-api/`.

## What's included

- **`agents/`** — scoped subagents:
  - a read-only reviewer that finds issues but never edits code
  - a fixer that applies edits/fixes based on review findings
- **`commands/`** — a workflow command that runs the subagents as a multi-step flow (parallel + dependent steps)
- **`skills/`** — a skill supporting the code-quality workflow
- **`hooks/`** — a hook that fires automatically as part of the workflow

## Install

From a marketplace:

```
/plugin marketplace add tuitioner/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Locally, from the repo root:

```
claude --plugin-dir .
```

Use `/reload-plugins` after editing any plugin file to pick up changes.

## Development

This repo is both the plugin and the marketplace that offers it — see `.claude-plugin/plugin.json` for the manifest and `.claude-plugin/marketplace.json` for the catalog entry. See `NOTES.md` for design notes on scoping and orchestration decisions.
