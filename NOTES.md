# Notes

## What this plugin does

`quality-guard` bundles a two-agent code-quality workflow for Express-style APIs:

- `code-reviewer` — a read-only agent that reads routes, the data store, and tests, checks them against the project's own conventions (documented in `course-api/CLAUDE.md`: one route file per resource, state only through `db/store.js`, `400`/`404` validation, `{ "error": "message" }` error shape) plus ordinary bugs, and returns a prioritized findings list. It cannot change anything — it only reports.
- `test-writer` — an agent that takes those findings (or a plain coverage request), applies small well-scoped fixes, adds or updates regression tests in `course-api/tests/`, and runs `npm test` / `npm run lint` to confirm before reporting back.

The `/qguard` command orchestrates them: two `code-reviewer` subagents run in parallel over different parts of the codebase, and once both are back, `test-writer` runs once against their combined findings. A `PostToolUse` hook lints any `.js` file inside `course-api/` right after Claude edits or writes it, and a skill (`code-review-checklist`) captures the project's conventions as a checklist either agent (or a human) can apply directly.

## Install

```
/plugin marketplace add kfhawas/claude-multi-agent-workflow
/plugin install quality-guard@kfhawas-marketplace
```

Or locally, from the repo root: `claude --plugin-dir .`, after `cd course-api && npm install` once.

## Scoping decision: why the reviewer is read-only and on a stronger model, and the writer is scoped narrower but can act

`code-reviewer` gets only `Read`, `Grep`, `Glob` and the `opus` model. Reviewing is a judgment call — deciding whether a missing check is actually exploitable, whether a status code is wrong given the rest of the API's contract, whether a "bug" is actually intended behavior — and that's exactly the kind of ambiguous, multi-file reasoning a stronger model is worth paying for. It also has no business editing anything: a reviewer that can silently "fix" what it's supposed to be flagging would hide its own findings from the person relying on the review, and would make the two-agent split (review vs. fix) pointless. Keeping it read-only is also what makes it safe to run two instances of it in parallel over overlapping territory (`server.js` shows up in Reviewer A's scope and could plausibly matter to Reviewer B too) — two read-only agents can never step on each other's changes.

`test-writer` gets `Read, Grep, Glob, Write, Edit, Bash` and the cheaper `sonnet` model. Writing a regression test for a known bug, or applying a fix a review already specified precisely, is a much more mechanical task than deciding whether the bug matters in the first place — the hard judgment call already happened in step 1. It needs `Bash` specifically to run `npm test` and `npm run lint` and verify its own work rather than just asserting it's done, and `Write`/`Edit` because "propose a diff" would just reintroduce a human copy-paste step the assignment is trying to remove. `sonnet` is enough for well-scoped, already-diagnosed changes, and it's cheaper to run per-fix than `opus`.

## Orchestration decision: why the review step is parallel and the fix step is dependent

The two `code-reviewer` invocations in Step 1 are parallel because they're genuinely independent: one reads `routes/` and `server.js`, the other reads `db/store.js` and `tests/`, and neither needs the other's findings to do its job — running them sequentially would just add latency for no benefit. Step 2 has to be dependent (sequential, after both reviews return) because `test-writer` needs the *combined* findings list as its input — fixes should be applied against a complete, de-duplicated picture of what's wrong, not against half of it while the other reviewer is still working, and a fix applied before both reviews land risks the second reviewer flagging a line that's already been rewritten out from under it.
