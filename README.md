# shipmate

A pre-PR code-quality plugin for small Express APIs. It reviews what changed, checks it against the project's own conventions, and fills in any missing test coverage — all orchestrated by one command.

## What's in it

- **`code-reviewer`** (read-only) — reviews changed routes, store functions, and tests for bugs, missing validation, and convention violations (route-per-file, store-only data access, `400`/`404` shape, `{ "error": "message" }` responses). Flags any route or store change with no matching test.
- **`test-updater`** (writes) — given a coverage gap, adds or updates tests in `tests/` following the project's existing `node:test` + `supertest` pattern, then runs the suite and reports the result.
- **`/shipmate:ship-check`** — the workflow command. Runs two `code-reviewer` passes in parallel (routes/store, and tests), waits for both, then — only if gaps were found — runs `test-updater` to fill them in, and reports a single pre-PR checklist.
- **`add-route` skill** — fires automatically when you ask to add a new resource/endpoint; encodes the project's route/store/test/docs pattern so Claude follows it without being told each time.
- **Commit guard hook** — blocks `git commit` whenever the API's test suite is currently red, so a broken change can't even land in a local commit.

## Installing it

From a fresh Claude Code session:

```
/plugin marketplace add anomajaya/claude-multi-agent-workflow
/plugin install shipmate@shipmate-marketplace
```

Or, for local development against this repo directly:

```
claude --plugin-dir .
```

## Using it

- Run `/shipmate:ship-check` before opening a PR to get a full review + coverage check.
- Ask to add a new resource (e.g. "add a /products route") and the `add-route` skill will apply the project's conventions automatically.
- Ask Claude to "review my recent changes" and it will reach for `code-reviewer` on its own.
- The commit guard fires silently in the background — you'll only see it if `npm test` is red when you try to commit.

This plugin ships alongside `course-api/`, the small Express API it's built and tested against.
