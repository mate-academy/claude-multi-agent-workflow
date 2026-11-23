---
description: Run the API quality workflow on course-api - parallel read-only analysis, chosen gaps, tests added under course-api/tests/, then npm test and lint
---

Run the API quality workflow on course-api/. Follow the steps in order. Do not start a step until the previous one has finished.

Working directory: every path below is relative to the project root, the directory that contains course-api/ (for example course-api/docs/api.md). Run the Bash commands from the project root. If the session was started inside course-api/, use ../ before each path, or run `cd` to the project root first in the same Bash command.

Rules for the whole run:
- This workflow never edits application code (course-api/routes/, course-api/db/, course-api/server.js). Only course-api/tests/ may change.
- Never weaken an existing assertion to make a test pass. If a new test fails, the application may be wrong: report it and leave the expectation unchanged.
- Changes that already existed before this run are not violations. Compare against the snapshot, not against a clean tree.

Step 0 - Load conventions, before any subagent starts. Invoke the skill api-quality-kit:api-test-conventions with the Skill tool. Keep the returned rules as TEST_CONVENTIONS. Do not search the filesystem for the plugin's files. You will paste TEST_CONVENTIONS into the prompt of the test writer.

Step 1 - Baseline snapshot, before any subagent starts. Run this in Bash from the project root and keep the printed directory as BEFORE:
```bash
BEFORE=$(mktemp -d)
git diff --no-color -- course-api > "$BEFORE/tracked.diff"
git ls-files -o --exclude-standard -- course-api | sort > "$BEFORE/untracked.list"
while read -r f; do sha256sum "$f"; done < "$BEFORE/untracked.list" > "$BEFORE/untracked.sha"
echo "$BEFORE"
```

Step 2 - Parallel analysis, both read-only. Send both in one message:
- api-quality-kit:api-reviewer - review course-api/server.js, course-api/routes/ and course-api/db/ against course-api/docs/api.md and course-api/CLAUDE.md. It returns confirmed findings only.
- api-quality-kit:test-writer, ANALYZE mode - include TEST_CONVENTIONS in the prompt. Map existing tests in course-api/tests/ to the rules in course-api/docs/api.md and list uncovered rules. It must not write.
Wait until BOTH have returned a result. Before moving on, state which two subagent results you received.

Step 3 - Check that analysis changed nothing. Repeat the Step 1 snapshot into AFTER1 and run `diff -r "$BEFORE" "$AFTER1"`. If anything differs, stop and report the paths.

Step 4 - Dependent step, main Claude only. From the two reports, choose the gaps to test. Keep a gap only if course-api/docs/api.md or course-api/CLAUDE.md states the rule. List each rejected finding with one line on why. Do not turn speculation into requirements.

Step 5 - Write tests. Start api-quality-kit:test-writer in WRITE mode. Put TEST_CONVENTIONS and the chosen gaps in its prompt, and nothing else from the analysis. Wait for its result.

Step 6 - Check the scope of writes. Repeat the snapshot into AFTER2 and compare with BEFORE using `diff -r`. Every path whose content or existence changed must be under course-api/tests/. If any other path changed, stop and report it.

Step 7 - Checks. Run `npm test` and `npm run lint` in course-api/. Report the exact pass and fail counts. If a new test fails, leave it failing and report the assertion, the endpoint and the contract line it relates to.

Step 8 - Report. Give: confirmed reviewer findings; chosen gaps; rejected findings with reasons; tests added (file and test names); the results of Step 3 and Step 6; the output summary of Step 7.
