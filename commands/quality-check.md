---
description: Run the code-quality workflow against course-api — parallel review, then a dependent test-writing pass.
---

Run a two-stage code-quality workflow against `course-api/`.

**Stage 1 — parallel review.** These two reviews don't depend on each other, so start them at the same time and wait for both to finish:
1. Launch the `code-reviewer` subagent scoped to `course-api/routes/` and `course-api/db/` — the request-handling and data-access code.
2. Launch the `code-reviewer` subagent scoped to `course-api/tests/` — whether the existing tests are well-structured and what looks under-covered.

**Stage 2 — dependent fix-up.** This stage needs Stage 1's findings before it can start, so only begin it once both reviews are back. Take the combined findings — specifically anything either reviewer flagged as untested or under-tested — and hand it to the `test-writer` subagent as a concrete list of gaps to close. Have it write or update tests under `course-api/tests/` and run `npm test` inside `course-api/` to confirm the suite passes.

**Report back:**
- What each reviewer found (routes/db pass and tests pass), separating merge-blocking issues from polish.
- What tests `test-writer` added and which gaps they close.
- The final `npm test` result.
