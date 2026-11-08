# api-quality plugin

## What it does

The `api-quality` plugin reviews an Express API for code quality issues, applies fixes, and summarizes the changes. It bundles two scoped subagents (`code-reviewer` and `fixer`), a workflow command (`/api-quality:quality-check`), a skill (`api-quality`), and a hook that runs ESLint automatically after every edit.

## How to install

```bash
# Add the marketplace
/plugin marketplace add https://github.com/s-leoni/claude-multi-agent-workflow

# Install the plugin
/plugin install api-quality@api-quality-marketplace
```

Then run `/api-quality:quality-check` from a session with the `course-api/` server running.

## Scoping decision

The `code-reviewer` agent is restricted to `tools: Read, Grep, Glob` — read-only tools only. A reviewer's job is to look, not to touch. Giving it `Edit` or `Write` would let it accidentally modify files while trying to understand them, which undermines the whole point of a separate review step. By restricting the tools at the harness level, the constraint is enforced regardless of what the agent is asked to do.

## Orchestration decision

In the `quality-check` command, the code review and the lint check run in parallel because they are both independent reads — neither one needs the other's output to do its job. Running them simultaneously cuts the wait time in half. The `fixer` step runs after both finish because it needs their combined findings as input. The summarize step runs last because it needs the fixes to already be applied before it can describe what changed. Sequential steps are only sequential where there is a real data dependency.
