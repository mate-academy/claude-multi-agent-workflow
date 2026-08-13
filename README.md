# code-quality

A Claude Code plugin that runs a two-agent code-quality workflow — parallel review, then a dependent fix-and-verify pass — against an Express API. Built and tested against the sample app in `course-api/`.

## What's inside

| Component | Name | What it does |
|---|---|---|
| Agent (read-only) | `code-reviewer` | Reads routes/db/server code, reports bugs, missing validation, and convention violations. Never edits files. |
| Agent (write) | `test-fixer` | Runs `npm test` / `npm run lint`, fixes the underlying issues, adds missing test coverage, re-verifies. |
| Command | `/code-quality:audit` | Orchestrates both agents: reviews `routes/` and `db/`+`server.js` in parallel, then runs `test-fixer` on the combined findings. |
| Skill | `api-review-checklist` | The house rules for course-api routes (validation, status codes, error shape, data access) that both agents lean on. |
| Hook | `PostToolUse` on `Edit`/`Write` | Runs `eslint --fix` over `course-api/` after every edit, via a bundled script. |

## Install

From a fresh Claude Code session:

```
/plugin marketplace add <this-repo-url-or-owner/repo>
/plugin install code-quality@<marketplace-name>
```

Or, to try it locally without installing, from the repo root:

```
claude --plugin-dir .
```

## Use it

```
cd course-api && npm install   # once
/code-quality:audit
```

The command reviews `course-api/routes/` and `course-api/db/store.js` + `server.js` in parallel with two `code-reviewer` runs, then hands the combined findings to `test-fixer`, which fixes what it can and re-runs `npm test` / `npm run lint` to confirm.

See `NOTES.md` for the reasoning behind the scoping and orchestration decisions.
