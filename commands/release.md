---
description: Draft the changelog for a release, then verify the repo is actually ready to tag it.
argument-hint: "[version]"
---

Run the release workflow, orchestrating the `release-readiness-checker` and `changelog-writer` subagents. If a version was given as an argument, use it as the target release version; otherwise infer it from the manifests.

**Step 1 — parallel.** Neither of these needs the other's output, so launch them at the same time and wait for both to finish:
- `release-readiness-checker` — audit the *current* state of the repo before any changes: what version `package.json` / `.claude-plugin/plugin.json` currently declare, and whether `CHANGELOG.md` already has an entry for the target version.
- `changelog-writer` (draft mode) — inspect `git log` since the last tag and produce a categorized draft (Added / Changed / Fixed / Removed) of what happened. Do not write to `CHANGELOG.md` yet at this step.

**Step 2 — dependent on step 1.** Launch `changelog-writer` again, this time to write the real entry into `CHANGELOG.md`. Feed it both results from step 1: the categorized draft, and the audit findings (e.g. if the checker flagged a version mismatch, resolve to the correct target version before writing). This step cannot start until both halves of step 1 are done.

**Step 3 — dependent on step 2.** Launch `release-readiness-checker` once more, now that `CHANGELOG.md` has actually been updated, to confirm the repo is release-ready: versions consistent, the new changelog entry present and non-empty. This step cannot run until step 2's write has landed.

Report step 3's Ready / Not ready verdict back to the user as the result of this command. If it comes back "Not ready", stop there and report exactly what it flagged instead of declaring the release done.
