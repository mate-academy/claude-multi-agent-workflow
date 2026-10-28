# Notes — code-quality-workflow

## What it does

A code-quality plugin for `course-api/`, the Express API used throughout this course. It bundles:

- `code-reviewer` — a read-only subagent that inspects a file and reports findings (bugs, missing validation, inconsistent error handling, style).
- `fix-applier` — a subagent that takes a findings list and edits the flagged files to fix them.
- `/review-and-fix` — a workflow command that runs `code-reviewer` over `routes/health.js`, `routes/users.js`, and `db/store.js` in parallel, then runs `fix-applier` once on the combined findings.
- `express-review-checklist` — a skill encoding this codebase's own conventions (validation → 400, missing record → 404, `{ "error": "message" }` error shape, all data access through `db/store.js`) so review and fixes stay consistent with existing code.
- A `PostToolUse` hook that runs `npm run lint` in `course-api/` after any `Edit`/`Write`, as a non-blocking signal.

## How to install

From a fresh `claude` session:
```
/plugin marketplace add linmaweb/claude-multi-agent-workflow
/plugin install code-quality-workflow@code-quality-marketplace
```
Or for local development without installing: `claude --plugin-dir .` from the repo root.

## Scoping decision: why `fix-applier` is on `opus` and has `Edit`/`Write`, while `code-reviewer` is on `sonnet` and read-only

`code-reviewer`'s job is pattern-matching against a known checklist — spotting a missing `400`, a wrong error shape, an un-awaited call. That's bounded, low-ambiguity work, so it's restricted to `Read, Grep, Glob` (it has no business touching files — a reviewer that can edit stops being a trustworthy second opinion) and runs on `sonnet`, which is plenty for this kind of targeted inspection.

`fix-applier` is higher-stakes: it has to understand a flagged issue well enough to produce a *correct* edit without breaking unrelated behavior, decide when a finding is ambiguous enough to skip, and actually hold `Edit`/`Write` to make the change. That calls for the strongest model available (`opus`) and the tools that match the job — nothing more (it still can't run arbitrary shell commands, since it only ever needs to read and edit specific files, not execute anything).

## Orchestration decision: why the review step is parallel and the fix step is sequential

The three files reviewed (`health.js`, `users.js`, `store.js`) are independent — reviewing one tells you nothing about the others, and nothing in one review depends on another finishing first. Running them in parallel is just correct resource use: three independent tasks with no ordering constraint.

The fix step is the opposite. `fix-applier` needs the *complete* picture before it starts — if it ran per-file as each review finished, it could miss a fix that depends on context from another file's findings (e.g. a shared pattern duplicated across routes), or do redundant work. So it's gated to start only after all three parallel reviews return, making it genuinely dependent rather than just "running after" by coincidence.
