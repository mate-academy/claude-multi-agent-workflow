# release-toolkit

## What it does

`release-toolkit` is a Claude Code plugin for release management. It bundles:

- **`changelog-writer`** (agent) — drafts and updates `CHANGELOG.md` from `git log`, grouped into Added/Changed/Fixed/Removed.
- **`release-readiness-checker`** (agent, read-only) — audits whether a repo is actually ready to tag: version numbers agree across manifests, and `CHANGELOG.md` has a real dated entry for the version being released.
- **`/release`** (command) — orchestrates both agents into one release workflow.
- **`semver-bump`** (skill) — rules for picking major/minor/patch and applying it consistently across `package.json`, `.claude-plugin/plugin.json`, and `CHANGELOG.md`.
- **`check-tag-readiness`** (hook) — a `PreToolUse` hook that blocks `git tag` via the Bash tool unless `CHANGELOG.md` already documents the version in the manifest.

## Installing it

From a fresh session, in this repo:

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install release-toolkit@release-toolkit-marketplace
```

To test locally without publishing anything, load it straight from disk instead:

```
claude --plugin-dir .
```

One quirk found while testing: in a non-interactive (`-p`) session, the workflow command had to be invoked by its fully namespaced form, `/release-toolkit:release` — the bare `/release` wasn't recognized. Interactive sessions resolve the short form fine once the plugin is installed/loaded normally.

## Scoping decision: why the two agents have different tools and models

`release-readiness-checker` is deliberately locked to `Read, Grep, Glob` (no `Bash`, `Edit`, or `Write`) and runs on `haiku`. Its whole job is to compare version strings across a couple of files and check a changelog entry exists — a read-only pattern-matching task with no real ambiguity, so a cheap model with no ability to mutate anything is the right fit. It's also the piece a `git tag` hook effectively "trusts" not to have side effects, so keeping it strictly read-only is a safety property, not just an optimization.

`changelog-writer` needs `Bash` (to run `git log`), `Edit`/`Write` (to actually update `CHANGELOG.md`), and `Read/Grep/Glob` to match the existing file's format — and it runs on `sonnet` because turning raw commit messages into coherent, categorized, user-facing release notes takes real judgment, not just pattern matching. Giving the checker those same tools would have been strictly more power than its job needs; giving the writer fewer tools would have made it unable to do its job at all.

## Orchestration decision: why step 1 is parallel and steps 2–3 are sequential

`/release` runs `release-readiness-checker` (auditing the *current* state) and `changelog-writer` in draft mode (summarizing `git log` into a categorized draft) **in parallel**, because neither one needs the other's output — auditing what's currently true and summarizing what changed are independent reads over the same repo.

Step 2 (writing the real `CHANGELOG.md` entry) and step 3 (re-running the readiness check) are **sequential** by necessity: step 2 needs both halves of step 1 to have finished (the draft to write, and the audit findings to resolve things like a version mismatch before deciding what to write), and step 3 has to happen *after* step 2's write actually lands on disk — checking readiness before the changelog exists would just report "not ready" every time. Sequencing here isn't a style choice, it's a real data dependency: each step consumes an artifact the previous one produced.
