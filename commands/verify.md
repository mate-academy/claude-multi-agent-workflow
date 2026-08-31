Run a two-stage review-and-test workflow over the current changes, using the code-reviewer and test-writer subagents.

1. Figure out which files changed (diff against the base branch, or the working tree if nothing is committed yet). If nothing changed, say so and stop.

2. Parallel step — review every changed file at once. For each changed file, launch a separate code-reviewer subagent call for just that file. These reviews don't depend on each other, so start them all together rather than one after another, and wait for all of them to come back before moving on.

3. Sequential step — write tests based on what the reviews found. This step must wait for step 2 to finish, because it needs the reviews' output: gather the findings from every code-reviewer call, then launch a single test-writer subagent call, handing it the full list of changed files plus the combined findings (especially anything flagged as an untested edge case or missing error path). Let it write or extend the relevant test files and run them.

4. Report back to the user in one summary: the review findings grouped by file and severity, then the test files test-writer wrote or edited, what each new test covers, and whether the test run passed.
