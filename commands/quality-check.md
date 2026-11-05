---
description: Run the full code-quality workflow. Parallel review, then tests for what was found, then a summary.
argument-hint: [folder, defaults to course-api]
---

Run a code-quality check on $ARGUMENTS (use course-api if no folder is given).

Step 1 (parallel): Launch two code-reviewer subagents at the same time:
- Reviewer A: the routes folder
- Reviewer B: everything else (middleware, models, app setup)
Wait for both to finish.

Step 2 (depends on Step 1): Combine both reviewers' findings. Take every finding marked "needs a test: yes" and pass that list to the test-writer subagent. If there are none, skip to Step 3.

Step 3 (depends on Step 2): Give me one summary:
- all findings, sorted by severity
- tests that were added
- final npm test result
- the top 3 things to fix first