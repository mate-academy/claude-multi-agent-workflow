---
description: Review the current changes and write regression tests for whatever the review flags, in one run.
---

Run this as a two-phase workflow that uses the `code-reviewer` and `test-writer` subagents already defined in this plugin's `agents/` folder.

**Phase 1 — Review (parallel).** Figure out which files changed (diff against the base branch, or the files the user just pointed at). Split them into independent groups — by directory, by feature area, or by unrelated concern, whatever keeps each group self-contained. Launch one `code-reviewer` subagent per group, all at the same time, so the reviews happen in parallel instead of one after another. Do not move on until every one of them has reported back.

**Phase 2 — Test (sequential, depends on Phase 1).** This phase cannot start until Phase 1 is fully done, because it acts on Phase 1's output. Collect every finding from all the reviews. For each one that describes a real bug or a risky edge case (skip pure naming complaints — those don't need a test), launch a `test-writer` subagent and hand it that specific finding, asking it to add a regression test that exercises exactly the failure scenario described. Run these one at a time or together as makes sense, but only after the review findings they depend on are in hand.

**Report back:** the full list of review findings from Phase 1 (grouped by file), followed by the list of test files `test-writer` created or edited in Phase 2 and what each new test covers. If Phase 1 found nothing worth testing, say so and skip Phase 2.
