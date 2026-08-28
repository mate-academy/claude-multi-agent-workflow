---
name: release
trigger: /release-toolkit:release
---

Execute a full release workflow for course-api:

**Step 1 — Parallel checks (run together, no dependencies):**
- Launch the release-readiness-auditor subagent to audit course-api for blockers: version/changelog sync, leftover debug code, missing test coverage, uncommitted changes.
- Simultaneously, run `npm run lint` and `npm test` inside course-api/ to ensure the code passes linting and all tests pass.

**Step 2 — Dependent bump (run only if Step 1 succeeds):**
Once both parallel checks complete with no blocking failures:
- Collect their results (audit findings, lint output, test results, git log from Step 1).
- Pass this summary to the changelog-version-bumper subagent.
- The agent will decide the new semver version, draft a CHANGELOG.md entry categorizing the changes (Added/Changed/Fixed/Removed), and bump course-api/package.json's version field.

**Step 3 — Report:**
Output the final version number, the changelog excerpt, and instructions to run `git tag <version>` and commit the changes.

If either Step 1 check fails, stop and report the failures instead of proceeding to the bump.
