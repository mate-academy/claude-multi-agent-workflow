---
description: Review, test, and repair the bundled Express API with parallel evidence gathering.
argument-hint: "[focus area]"
disable-model-invocation: true
---

Run the Toolbelt API quality-gate workflow for `course-api/`. Treat `$ARGUMENTS` as an optional focus area; if it is empty, review the whole API.

1. In the same assistant turn, launch `toolbelt:api-reviewer` and `toolbelt:api-test-investigator` in parallel. Give both the optional focus area and tell them to return their reports to this workflow. Do not begin repair work or wait for one before launching the other.
2. Wait for both reports. Combine only verified, actionable findings; discard duplicates and clearly record a clean result when no repair is needed.
3. If repairable findings remain, invoke `toolbelt:api-repairer` with the combined findings and focus area. Wait for its test and lint results before continuing.
4. Report the parallel review and investigation results, repairs made (if any), verification status, and unresolved findings. Never commit or push changes.
