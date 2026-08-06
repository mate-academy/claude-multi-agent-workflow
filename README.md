# shipwright

A Claude Code plugin that ships releases for you: it summarizes unreleased
changes, writes the changelog entry, bumps the version, and blocks a `git
push` that would leave a release behind.

## Install

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install shipwright@shipwright-marketplace
```

## What's in it

- **`release-scout`** (read-only) — reads `course-api/CHANGELOG.md`'s
  `Unreleased` section and cross-checks it against the source tree, returns
  a categorized summary of what's changed.
- **`release-writer`** (writes) — takes that summary, decides the version
  bump, writes the changelog entry, and bumps `course-api/package.json`.
- **`/release`** — orchestrates both: runs `release-scout` and the test
  suite in parallel, then runs `release-writer` if tests passed and there's
  something to ship.
- **`changelog-format` skill** — the category and version-bump rules the
  agents follow.
- **A `git push` hook** — blocks the push if `CHANGELOG.md` still has
  unreleased changes sitting in it.

See `NOTES.md` for install details and design decisions.