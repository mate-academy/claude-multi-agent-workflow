---
description: Review the course API and close its test gaps with the api-reviewer and test-helper subagents
argument-hint: [optional focus, for example routes/users.js]
---
Run a quality check on the Express API in course-api/. Extra focus from the user, if any: $ARGUMENTS

Use this plugin's two subagents, api-reviewer and test-helper, in this order:

Step 1 - run in parallel. These two jobs do not depend on each other, so start both at the same time:
- api-reviewer: review course-api/ and return its findings in its usual shape.
- test-helper in analysis mode: list which route behaviours the tests in course-api/tests/ cover and which they do not. It must not edit any file in this step.

Step 2 - wait until both Step 1 agents have finished. This step needs both results:
- test-helper in write mode: pass it the High and Medium findings from api-reviewer and the "Not covered" list from its own analysis. It writes tests for the most important gaps (at most five) in course-api/tests/ only, then runs npm test from course-api/.

Step 3 - after Step 2 has finished, write the final report yourself, with these four headings:
- Review findings: the High and Medium items from api-reviewer
- Tests added: what test-helper added, and the test run result
- Bugs found: real bugs that new tests exposed, or "none"
- Next steps: up to three suggestions

Do not change application code in routes/, db/ or server.js, and do not commit anything.
