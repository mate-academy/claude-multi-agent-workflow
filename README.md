# code-quality

A Claude Code plugin that reviews changes to this repo's Express routes, keeps the API doc honest, and lints edits as they land — built and tested against the small `course-api/` Express app in this same repo.

This repo is both the plugin and the marketplace it's published from.

## What's in it

- **`api-reviewer`** (agent, read-only) — reviews changed route files for convention violations and logic bugs, and flags when the API doc has fallen out of date. Doesn't edit anything.
- **`docs-syncer`** (agent, can edit) — brings `docs/api.md` back in line with what the routes actually do, once told what changed.
- **`/ship-check`** (command) — runs `api-reviewer` and the test suite in parallel, then dispatches `docs-syncer` only if the review found doc drift.
- **`api-conventions`** (skill) — the house rules (status codes, error shape, where state lives) that the agents check against.
- **hook** — after every file edit, runs `eslint` on the touched file (if the project has an eslint config) and surfaces any issues.

## Install

From a fresh Claude Code session:

```
/plugin marketplace add MykhailoIvchenko/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Or, to try it locally without publishing anything, from the repo root:

```
claude --plugin-dir .
```

## Try it

```
cd course-api && npm install
```

then, inside Claude Code with the plugin loaded, edit a route file and run:

```
/ship-check
```

See `NOTES.md` for the reasoning behind how the agents are scoped and why the workflow is split the way it is.
