# code-review

A Claude Code plugin that reviews Express API routes for correctness and
convention issues, then writes the tests to close whatever gaps the review
finds.

Built and tested against the small Express API in [`course-api/`](course-api/).

## Install

```
/plugin marketplace add FelipeDeYcaza/claude-multi-agent-workflow
/plugin install code-review@code-review
```

## What's inside

- **Subagents** (`agents/`)
  - `api-reviewer` — read-only. Reviews a route file against `course-api/CLAUDE.md`'s
    conventions and reports findings; never edits code.
  - `test-writer` — writes and edits Node test files to cover the gaps a
    review turns up, then runs the suite to confirm they pass.
- **Command** (`commands/`) — `/quality-check` runs the two subagents as a
  workflow: reviews run in parallel across the target route files, then the
  test-writer runs once, depending on all the review findings.
- **Skill** (`skills/`) — `route-conventions`, the house rules for Express
  routes in this codebase (validation, status codes, error shape), loaded by
  both subagents so their judgment matches the project's own style.
- **Hook** (`hooks/`) — runs ESLint on any JS file the plugin edits, so a
  test-writer pass can't silently leave lint errors behind.

## Test locally

```
cd course-api && npm install
cd ..
claude --plugin-dir .
```

Then run `/quality-check` against a route file, e.g. `course-api/routes/users.js`.
Use `/reload-plugins` after editing any plugin file to pick up changes.

See [`NOTES.md`](NOTES.md) for the scoping and orchestration decisions behind
this plugin's design.
