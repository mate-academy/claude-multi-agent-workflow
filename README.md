# code-quality-kit

A Claude Code plugin that bundles a multi-agent code quality workflow for the Express API in [`course-api/`](./course-api).

## What it does

`code-quality-kit` packages subagents, a workflow command, a skill, and a hook that together:

- **Review code** in `course-api/` for correctness, style, and maintainability issues.
- **Write tests** for the Express routes and handlers in `course-api/`, filling in coverage gaps.

## Status

This is an early scaffold. The plugin structure is in place; subagents, the workflow command, the skill, and the hook are being built out next.

## Layout

```
.claude-plugin/
  plugin.json       # plugin manifest (name, version)
agents/             # scoped subagents (reviewer, test writer, ...)
commands/           # workflow command(s) that orchestrate the subagents
skills/             # supporting skill(s)
hooks/              # hooks (e.g. hooks.json)
course-api/         # the Express API this plugin is built and tested against
```

## Try it locally

From the repo root:

```
claude --plugin-dir .
```

Then use `/reload-plugins` after making changes to pick them up.
