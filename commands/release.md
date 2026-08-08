---
description: Ship a release — summarize unreleased changes, run the test suite, then write the changelog and bump the version if everything's healthy.
---

Run the release process for `course-api/`:

1. At the same time, in parallel:
   - Dispatch the `release-scout` subagent to read `course-api/CHANGELOG.md`
     and the `course-api/` source tree and return a categorized summary of
     what's changed since the last release.
   - Run the test suite: `cd course-api && npm test`.

2. Once both finish, decide how to proceed:
   - If the test suite failed, stop here. Report the failure and do not run
     `release-writer` — never release on top of a broken build.
   - If `release-scout` reported `Nothing to release.`, stop here. Report
     that there's nothing to ship — this is a normal, successful outcome.
   - Otherwise, dispatch the `release-writer` subagent, passing it the exact
     categorized summary `release-scout` returned. `release-writer` depends
     on that summary — don't start it before `release-scout` finishes.

3. Report the outcome to the user:
   - On a successful release: the new version number and the one-line
     summary `release-writer` returned, plus a reminder to commit, tag
     (`git tag vX.Y.Z`), and push.
   - On a stopped release (failed tests or nothing to release): say why,
     plainly, and don't suggest next steps beyond fixing the tests or
     making more changes first.
