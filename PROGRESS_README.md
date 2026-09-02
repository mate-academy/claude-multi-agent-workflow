# code-quality

A Claude Code plugin that bundles a multi-agent code quality workflow — review, tests, and formatting — built and tested against the Express API in `course-api/`.

> Draft README for the plugin. Will be renamed to `README.md` once the plugin is complete (the current root `README.md` holds the course assignment brief until then).

## What's in here

- **Subagents** (`agents/`) — scoped workers for the review/fix loop.
- **Workflow command** (`commands/`) — orchestrates the subagents (parallel + sequential steps).
- **Skill** (`skills/`) — packaged guidance supporting the workflow's theme.
- **Hook** (`hooks/`) — automated check wired into the plugin's lifecycle.

## Install

```
claude --plugin-dir .
```

Or, once published as a marketplace:

```
/plugin marketplace add <this-repo>
/plugin install code-quality@<marketplace-name>
```

## Status

Scaffolding in progress — see `README.md` for the full task checklist this plugin is being built against.
