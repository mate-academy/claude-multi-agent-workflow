# course-quality

A Claude Code plugin that runs a small **multi-agent code-quality workflow** against the
Express API in [`course-api/`](./course-api). It ships two scoped subagents, a workflow
command that orchestrates them, a skill, and a hook — and the repo doubles as the
marketplace that offers the plugin.

> The original course assignment brief lives in [`ASSIGNMENT.md`](./ASSIGNMENT.md).

## What's in the box

| Component | Path | What it does |
|-----------|------|--------------|
| Reviewer subagent | `agents/reviewer.md` | Read-only review of the API code. Reports findings; never edits. |
| Fixer subagent | `agents/fixer.md` | Runs tests/lint and applies fixes. Can edit code and run commands. |
| Workflow command | `commands/quality.md` | `/quality` — runs review **and** lint in parallel, then the fixer as a dependent step. |
| Skill | `skills/api-conventions/SKILL.md` | The `course-api` conventions, loaded when working on it. |
| Hook | `hooks/hooks.json` | After any edit, lints the changed code via a bundled script. |

## Install

From this repo as a marketplace:

```
/plugin marketplace add <this-repo>
/plugin install course-quality@course-quality-marketplace
```

Or load it locally without installing, from the repo root:

```
claude --plugin-dir .
```

## Use

```
cd course-api && npm install     # one-time, so tests/lint can run
/quality                         # run the full review → fix workflow
```

Each component is namespaced under the plugin: `/course-quality:quality`, the
`course-quality:reviewer` and `course-quality:fixer` subagents, and the
`course-quality:api-conventions` skill.

See [`NOTES.md`](./NOTES.md) for the scoping and orchestration decisions.
