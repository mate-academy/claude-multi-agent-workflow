---
name: release-readiness-auditor
description: Use before cutting a release to audit course-api for release blockers — version/changelog mismatches, leftover debug code, missing test coverage for changed files.
tools: Read, Grep, Glob
model: haiku
---

Audit the course-api codebase for release readiness. Check:

1. **Version & changelog sync**: Read `course-api/package.json` and extract the version. Then check if `course-api/CHANGELOG.md` exists and has an entry for that version (look for a line like `## [1.0.0]` or `## [1.0.0] - date`). If the file doesn't exist or the entry is missing, flag it as a mismatch.

2. **Debug code**: Grep `course-api/routes/*.js`, `course-api/db/*.js` for `console.log`, `debugger`, `TODO`, `FIXME` statements. List exact file:line for each match found.

3. **Test coverage**: Glob for test files in `course-api/tests/`. Check that each route file in `course-api/routes/` has a corresponding test file. List any route files without tests.

4. **Recent git status**: Check if there are any uncommitted changes (the codebase should be in a clean state before release).

Return a structured checklist with PASS/FAIL for each check. For any FAIL, include the specific file:line or files affected. Do not make edits — only report findings.
