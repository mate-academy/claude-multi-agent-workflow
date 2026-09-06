---
description: Review the Express API against its conventions with parallel reviewers, then backfill the tests those reviews call for.
argument-hint: [path to the API, defaults to course-api/]
---

Run a full quality sweep over the API at `$1` (default `course-api/`).

## Step 1 — Review, in parallel

Launch **two `api-reviewer` subagents in a single message so they run at the same time**. They read
disjoint parts of the tree, so neither has anything to wait for:

- **Reviewer A — the surface.** Scope: `$1/server.js` and `$1/routes/`. Mounting, validation order,
  status codes, and the `{ "error": "message" }` shape on every failure path.
- **Reviewer B — the core.** Scope: `$1/db/store.js` and `$1/tests/`. Store helpers as the only
  state owner, id handling, and which behaviours the existing suite already pins down.

Both return the report format their agent definition specifies. Do not start Step 2 until both
have come back — and do not summarise, edit, or soften their findings on the way through.

## Step 2 — Backfill the tests, after both reviews land

This step is sequential on purpose: its input is the **merged** `Untested behaviour` lists from
both reviewers, and Reviewer B is the one that knows what the suite already covers. Starting it
early would mean writing tests that already exist.

Merge the two lists, drop anything Reviewer B marked as already covered, and hand the result to a
single **`test-author`** subagent. Give it the concrete list — request, expected status, expected
body — not a pointer to "the reviews".

## Step 3 — Report

Print one summary, in this order:

1. **Findings** — every finding from both reviewers, grouped `bug` → `convention` → `gap`,
   each as `file:line — what — fix`.
2. **Tests added** — file, test name, and the behaviour it pins down.
3. **Test run** — the actual `npm test` result from the test author.
4. **Left for a human** — bugs the tests exposed but nobody fixed, and anything skipped.

End with the one thing you would do next, in a single sentence. If the sweep found nothing,
say that plainly instead of padding the report.
