# NOTES

## What it does

`code-quality-workflow` is a plugin for reviewing `course-api`'s Express routes against the
project's own conventions and keeping its tests in sync with what the review finds. It bundles:

- `agents/api-reviewer.md` — read-only subagent that checks route/db files against
  `course-api`'s conventions (validation, status codes, error shape, `db/store.js` as the only
  data-access path) and returns findings, never edits.
- `agents/test-writer.md` — subagent that reads those findings and adds/updates Node
  test-runner tests in `course-api/tests/` to cover them.
- `commands/quality-check.md` — the `/quality-check` workflow command that runs both agents in
  the right order (see orchestration decision below).
- `skills/api-conventions/SKILL.md` — a reference for `course-api`'s conventions so the agents'
  checks are grounded in the real project rules instead of generic assumptions.
- `hooks/hooks.json` — a `PostToolUse` hook that lints `course-api` after any Edit/Write inside
  it, via a bundled script referenced through `${CLAUDE_PLUGIN_ROOT}`.

## Install

From the repo root:
```
claude --plugin-dir .
```
Or as a marketplace, from a fresh session:
```
/plugin marketplace add <this-repo>
/plugin install code-quality-workflow@code-quality-marketplace
```
Then run `/quality-check` against `course-api/` (after `cd course-api && npm install` once).
Use `/reload-plugins` after editing any plugin file to pick up changes.

## Scoping decision

`api-reviewer` is limited to `Read, Grep, Glob` — no `Edit`/`Write` — on purpose. A review step
should never silently rewrite the code it's judging; keeping it read-only means its output is
always a findings list a human (or the next agent) can act on deliberately, not a diff that
already happened. `test-writer` gets `Read, Write, Edit, Grep, Glob` because its whole job is to
add test files and edit existing ones — but it still has no reason to touch `routes/` or `db/`,
so it isn't handed broader write access than that.

## Orchestration decision

`/quality-check` runs the two `api-reviewer` calls (over `routes/users.js` + `db/store.js`, and
over `routes/health.js`) in **parallel** because they're independent reads over disjoint files —
there's no reason to make one wait on the other. `test-writer` runs as a **dependent** step
afterward because it needs the combined findings from both reviews before it can decide what's
missing test coverage; running it concurrently with the reviews would mean it starts writing
tests against an incomplete picture of what's wrong.
