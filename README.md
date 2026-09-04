# api-quality

A Claude Code plugin that runs a parallel review + test-coverage scan of an Express API, then
hands the merged findings to an agent that closes the gaps and runs the suite. This repo is
both the plugin and the marketplace that offers it.

Built against `course-api/`, the small Express API included in this repo — see
[`docs/ASSIGNMENT.md`](docs/ASSIGNMENT.md) for the original assignment brief this plugin
fulfills.

## Install

**From this marketplace, as a real user would:**

```
/plugin marketplace add kl1874/claude-multi-agent-workflow
/plugin install api-quality@kl1874-plugins
```

**Locally, for development** (from the repo root):

```
claude --plugin-dir .
```

Then `/reload-plugins` after any edit to pick up changes without restarting the session.

## What's inside

| Component | Name | Purpose |
|---|---|---|
| Agent | `api-reviewer` | Read-only. Reviews route handlers against documented conventions, returns findings. `opus`. |
| Agent | `test-gap-scout` | Read-only. Enumerates routes vs. tests, returns a coverage matrix. `haiku`. |
| Agent | `test-author` | Writes tests, applies low-risk fixes, runs the suite. `sonnet`. |
| Command | `/api-quality:api-sweep [target-dir]` | Orchestrates all three as a 4-step workflow (parallel inspect, then dependent fix + verify). |
| Skill | `express-api-conventions` | House templates and checklist for route handlers and tests. |
| Hook | `PostToolUse` on `Write\|Edit\|MultiEdit` | Runs `scripts/check-conventions.js` against any changed route file and flags convention breaks. |

## Usage

```
/api-quality:api-sweep course-api
```

Runs `api-reviewer` and `test-gap-scout` in parallel, merges their output into one worklist,
hands it to `test-author` to fix and test, then re-runs `api-reviewer` to confirm the fixes
landed. See [`NOTES.md`](NOTES.md) for why the steps are ordered the way they are, and one
scoping decision behind the agents' tools and models.

## Local testing

```
cd course-api && npm install && npm test && npm run lint
```

establishes a clean baseline; then load the plugin with `claude --plugin-dir .` from the repo
root and run `/api-quality:api-sweep` against it.
