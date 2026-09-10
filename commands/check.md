---
description: Review course-api's routes and data layer for bugs and convention drift, then write tests covering whatever gaps the review finds.
---

Run this as a two-stage workflow:

**Stage 1 — review, in parallel.** Launch the `code-reviewer` subagent twice at the same time, as independent parallel tasks:
- one instance scoped to `course-api/routes/` (all route handlers),
- one instance scoped to `course-api/db/store.js` (the data-access layer).

These two reviews don't depend on each other, so run them concurrently rather than one after the other. Each instance returns its findings grouped under Bugs, Convention drift, and Untested behavior.

**Stage 2 — write tests, dependent on Stage 1.** Once both reviews are back, merge their findings into a single list, de-duplicating anything both reviewers flagged. Take the "Untested behavior" items (and any "Bugs" that warrant a regression test) and hand that merged list to the `test-writer` subagent. This step cannot start until Stage 1 finishes, because it needs the merged findings as input.

**Finally**, report to the user in three short sections:
1. What was reviewed (files/scope).
2. What the reviewers found (bugs, convention drift, untested behavior — deduplicated).
3. What tests `test-writer` added or updated, and which findings, if any, were left unaddressed and why.
