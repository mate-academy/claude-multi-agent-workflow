# code-quality-kit

A Claude Code plugin that packages a two-agent code-quality workflow: review an Express-style API for bugs, convention drift, and coverage gaps — then fix and test what was found. Built and tested against the `course-api/` app in this repo.

## What's inside

| Component | Name | Purpose |
|---|---|---|
| Subagent | `code-reviewer` | Read-only audit of routes, db layer, and tests. Reports bugs, convention violations, and coverage gaps. Never edits files. |
| Subagent | `test-writer` | Takes concrete findings and fixes bugs / adds tests, then runs `npm test` and `npm run lint` to confirm. |
| Command | `/ship` | Runs the full workflow: two `code-reviewer` passes in parallel, then a dependent `test-writer` pass on the combined findings, then a summary. |
| Skill | `api-conventions` | Checklist of `course-api`'s conventions (validation, error shape, 404s, data-access rules) that both agents reference. |
| Hook | `PostToolUse` on `Edit`/`Write` | Runs `eslint` on any `course-api/*.js` file right after it's edited and surfaces warnings. |

## Install

From a marketplace (recommended):

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install code-quality-kit@code-quality-kit-marketplace
```

Or load it directly for local development, from the repo root:

```
claude --plugin-dir .
```

## Try it

With the plugin loaded and `course-api/` set up (`cd course-api && npm install`), run:

```
/ship
```

This reviews `course-api/routes/`, `course-api/db/store.js`, and `course-api/tests/` in parallel, then hands the combined findings to `test-writer` to fix and cover, then reports the result.

See `NOTES.md` for the scoping and orchestration decisions behind this design.
