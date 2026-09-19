# NOTES

## What this plugin does

`course-plugin` is a route-quality plugin for the `course-api` Express project. It keeps three things in sync whenever a route changes: the code's adherence to project conventions, the API documentation in `course-api/docs/api.md`, and the test suite in `course-api/tests/`.

It bundles:
- **Subagents** (`agents/`): `route-reviewer` (read-only convention check) and `test-writer` (writes/updates tests).
- **Workflow command** (`commands/route-workflow.md`): `/route-workflow` — runs the review and doc-sync check in parallel, then updates tests as a dependent step.
- **Skill** (`skills/manipulate-routes/SKILL.MD`): guides any route create/update/delete so `course-api/docs/api.md` is updated as part of the same change, using the doc as the source of truth for the contract.
- **Hook** (`hooks/hooks.json` + `hooks/remind-route-sync.sh`): a `PostToolUse` hook on `Edit|Write` that detects when a `course-api/routes/*.js` file was touched and reminds Claude (via stderr + exit code 2) to keep docs and tests in sync.

## Install

From a fresh session:
```
/plugin marketplace add <this-repo>
/plugin install course-plugin@<marketplace-name>
```
Or locally, from the repo root: `claude --plugin-dir .`, then `/reload-plugins` after edits.

Requires `course-api/` set up once: `cd course-api && npm install`.

## Scoping decision: why `route-reviewer` is read-only and `test-writer` isn't

`route-reviewer` only has `Read, Grep, Glob` — no `Edit`, `Write`, or `Bash`. Its job is to catch convention violations (mounting, `db/store.js`-only data access, validation status codes, error shape) and report them; it should never be the thing that quietly rewrites a route to "fix" it, because a convention judgment call belongs to the developer, not an automated pass. Keeping it read-only also means it's safe to run early and often, including in parallel with other read-only work, without any risk of it changing code out from under a step running alongside it.

`test-writer` gets `Read, Edit, Write, Bash, Glob, Grep` because its actual job is to modify `course-api/tests/` and then run `npm test` to confirm the result — a strictly read-only agent couldn't do that job at all. Both use `model: sonnet`: the work is code-shaped (parsing route behavior, matching test conventions) rather than a quick lookup or a very deep architectural judgment call, so a smaller model would risk missing edge cases and a larger one would be overkill for tasks this bounded.

## Orchestration decision: why `/route-workflow` runs Step 1 in parallel and Step 2 as a dependent step

Step 1 runs the `route-reviewer` subagent and a documentation-sync check against `course-api/docs/api.md` at the same time. Both are read-only analyses of the same route file(s) and don't depend on each other's output — one checks the code against `CLAUDE.md` conventions, the other checks the code against the documented contract. There's no reason to serialize two independent reads, so they run in parallel.

Step 2 (the `test-writer` subagent) deliberately waits for Step 1 to finish rather than running alongside it. Writing tests means asserting "this is the route's correct behavior" — if the route is about to be flagged as non-compliant or undocumented, locking that behavior into a test first would enshrine the bug instead of catching it. Making the test-writing step dependent on the review step means tests only get written once the route's current behavior has already been checked, not before.
