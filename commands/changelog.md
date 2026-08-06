---
description: Runs the release/changelog workflow — reviews the current diff, runs tests, and posts a changelog entry to Notion if both succeed.
---

Run the following as a workflow:

**In parallel**, run these two independent branches at the same time:

**Branch A — Review:**
1. Invoke the `code-reviewer` subagent to review and summarize the current git diff.

**Branch B — Test:**
1. Before running tests, write a failing default so an interrupted run can never leave a stale "passed" status:
   `mkdir -p .changelog-workflow && echo "failed" > .changelog-workflow/test-status`
2. Run the project's test suite via Bash (`cd course-api && npm test`).
3. If the tests passed, overwrite the status file to reflect that:
   `echo "passed" > .changelog-workflow/test-status`
   If the tests failed, leave the file as "failed" — no action needed, since that's already the default from step 1.
4. Capture the test output for reporting purposes.

Wait for both branches to complete before continuing.

**Then**, check the results:
- If the tests failed, stop here. Report that the changelog was not posted because tests are failing, and show the test failure output. Do not invoke `write-changelog`.
- If the tests passed and the review produced a summary, invoke the `write-changelog` subagent, passing it the code-reviewer's summary as input.
- If the tests passed but the review failed to produce a usable summary, stop and report that — don't post an empty or malformed entry.

**Finally**, report back to the user: whether the changelog was posted, the page title if it was, and a one-line reason if it wasn't.
