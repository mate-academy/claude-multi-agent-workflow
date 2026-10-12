---
description: Review the course API routes and tests, then write the missing tests
---

Run a quality check on the course API in two steps.

**Step 1 - review (at the same time).** Start two `api-reviewer` agents together, in one message, so they run in parallel. They do not depend on each other:
- Reviewer A looks at `course-api/routes`.
- Reviewer B looks at `course-api/tests`.

Wait until both have finished.

**Step 2 - write tests (after step 1).** Start one `test-writer` agent. Give it the full text of both reports. It needs them, so it must not start before step 1 is done. Ask it to write the tests that are missing, run them, and report the result.

**Finish.** Give me a short summary: the main issues from the reviews, the tests that were added, and the test result.
