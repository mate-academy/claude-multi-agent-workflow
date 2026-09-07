---
description: Orchestrate the review and TDD-builder subagents to ship a new feature test-first, reviewed before and after.
argument-hint: <description of the feature to build>
---

Ship the feature described in $ARGUMENTS using this workflow:

**Step 1 — run in parallel:**
- Dispatch `code-diff-reviewer` to review the current working tree diff (or, if there is none, the most recently changed files in the area the feature will touch) for any pre-existing security or correctness issues, so problems already in the codebase aren't confused with problems introduced by the new work.
- At the same time, dispatch `tdd-feature-builder` in research-only mode: have it scan the codebase for the testing framework, test file conventions, and code style relevant to where this feature will live, and report back what it found — without writing any files yet.

These two are independent of each other, so run them concurrently and wait for both to finish before continuing.

**Step 2 — depends on Step 1's convention scan:**
Dispatch `tdd-feature-builder` again, this time to do the real work: using the conventions it discovered in Step 1, write failing tests that capture the feature's requirements described in $ARGUMENTS, confirm they fail for the right reason, then implement the feature until those tests (and the rest of the suite) pass.

**Step 3 — depends on Step 2's implementation:**
Once the feature is implemented, dispatch `code-diff-reviewer` to review the resulting diff (the new tests plus the new implementation) for security and correctness issues. This step cannot start until Step 2 has produced a diff to review.

Finish by reporting: the conventions detected, the files created/changed, the test results, and any findings from the final review (or confirmation that none were found).
