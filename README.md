# code-quality-kit

A Claude Code plugin that bundles a small multi-agent code-quality workflow — review, test coverage, and lint checks — built and tested against the Express API in `course-api/`.

This repo is both the plugin and the marketplace that offers it.

## Status

Scaffolding in progress. Current layout:

```
.claude-plugin/
  plugin.json       — plugin manifest (name, version)
agents/              — scoped subagents (read-only reviewer, code-writer)
commands/            — the workflow command that orchestrates the subagents
skills/              — a supporting skill
hooks/               — a lifecycle hook
course-api/          — the Express API used to build and test the plugin against
```

## Install (once published)

```
/plugin marketplace add <this-repo>
/plugin install code-quality-kit@<marketplace-name>
```

## Develop locally

From the repo root:

```
claude --plugin-dir .
```

Use `/reload-plugins` to pick up edits as components are added.
