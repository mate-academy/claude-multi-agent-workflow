---
name: semver-bump
description: Use when deciding how to version a release — whether a set of changes is a major, minor, or patch bump under semantic versioning — and how to apply that version consistently across package.json, .claude-plugin/plugin.json, and CHANGELOG.md.
---

# Semver bump

Decide the bump by looking at what actually changed (the categorized changes from `changelog-writer`, or `git log`/`git diff` against the last tag), not by guessing:

- **Major** (`X.0.0`) — a breaking change: a removed or renamed public command/API, a config format change that isn't backward compatible, a dropped feature.
- **Minor** (`x.Y.0`) — a backward-compatible addition: a new command, subagent, skill, hook, or option that doesn't break existing usage.
- **Patch** (`x.y.Z`) — a backward-compatible fix: bug fixes, docs, internal refactors, dependency bumps with no behavior change.

If changes span more than one category, bump by the highest one that applies (one breaking change anywhere means major, regardless of how many minor/patch changes accompany it).

## Applying the bump

1. Read the current version from `package.json` (and `.claude-plugin/plugin.json` if this repo is itself a plugin) — they must agree; if they don't, fix the mismatch before bumping further.
2. Compute the new version per the rule above.
3. Update the version field in every manifest that declares one (`package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` entry if it duplicates the version).
4. Make sure `CHANGELOG.md` gets a section headed with that exact new version (this is what `changelog-writer` and `release-readiness-checker` check for) — don't bump the manifests without a matching changelog entry, or the release-readiness check will fail.
