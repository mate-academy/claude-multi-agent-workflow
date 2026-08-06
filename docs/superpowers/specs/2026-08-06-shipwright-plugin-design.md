# Shipwright plugin — design spec

Date: 2026-08-06
Status: Approved by user, pending implementation

## Goal

Build the course capstone plugin in this repo: a single installable Claude Code
plugin, themed around **shipping releases**, that bundles two scoped subagents,
a workflow command, a skill, and a hook — tested against `course-api/` and
published as its own marketplace. Must pass `.github/scripts/validate-plugin.js`
(runs on every push via `.github/workflows/validate.yml`).

Theme: **release plugin, action-first.** The pair of agents doesn't just review
code — one gathers facts, the other actually writes the changelog and bumps the
version. The hook enforces the habit (blocks a stale push) rather than merely
suggesting it.

## Target codebase

The plugin's agents operate on `course-api/`, not on the plugin's own files.
`course-api/package.json` currently has `"version": "1.0.0"` and no
`CHANGELOG.md` exists yet — implementation must bootstrap a starter
`course-api/CHANGELOG.md` (a `# Changelog` header plus an empty
`## [Unreleased]` section) so the agents have something to read on first run.

## Repo layout

```
.claude-plugin/
  plugin.json          # name: "shipwright", version: "0.1.0"
  marketplace.json      # lists shipwright, source: "./"
agents/
  release-scout.md      # read-only
  release-writer.md     # writes
commands/
  release.md              # /release — the orchestrator
skills/
  changelog-format/SKILL.md
hooks/
  hooks.json
  scripts/check-release-freshness.js
course-api/
  CHANGELOG.md            # bootstrapped, starts empty under Unreleased
README.md                 # rewritten to describe the plugin (original assignment
                           # brief stays recoverable in git history)
NOTES.md
```

Note: `.claude-plugin/` holds **only** `plugin.json` and `marketplace.json` —
`agents/`, `commands/`, `skills/`, `hooks/` all sit at the repo root (grader
checks this explicitly).

## Components

### 1. `plugin.json`
Minimal manifest: `name: "shipwright"`, `version: "0.1.0"`, a one-line
`description`. No other fields required.

### 2. Agent — `release-scout` (read-only)
- **Frontmatter:** `name: release-scout`, `tools: Read, Grep, Glob`,
  `model: haiku`, `description` written for the situation that triggers it
  ("Use when preparing a release to see what's changed since the last version").
- **Job:** Read `course-api/CHANGELOG.md`'s `## [Unreleased]` section (the
  running notes accumulated as work happens). Cross-check against the actual
  repo using `Glob`/`Grep` — flag source files under `course-api/routes`,
  `course-api/db` etc. that look new or changed but aren't mentioned, and flag
  notes that reference things no longer present. No writing.
- **Returns:** a structured, categorized summary — `Added` / `Changed` /
  `Fixed` / `Breaking` — ready for `release-writer` to act on. If
  `Unreleased` is empty and nothing looks unmentioned, it says so explicitly
  (this is the "nothing to release" signal the command checks for).

### 3. Agent — `release-writer` (writes)
- **Frontmatter:** `name: release-writer`, `tools: Read, Edit`,
  `model: sonnet`, `description` naming when to use it ("Use after
  release-scout has summarized changes, to actually cut the release").
- **Job:** Given the scout's categorized summary, decide the semver bump
  itself — fixes-only → patch, new backward-compatible behavior → minor,
  anything flagged `Breaking` → major — against the current
  `course-api/package.json` version. No confirmation pause (per approved
  decision: fully automatic).
- **Writes:**
  - A new dated `## [x.y.z] - YYYY-MM-DD` entry at the top of
    `course-api/CHANGELOG.md`, populated from the categorized summary, and
    clears `## [Unreleased]` back to empty.
  - Bumps `"version"` in `course-api/package.json` to match.
- **Returns:** the new version number and a one-line summary of what shipped.

### 4. Command — `commands/release.md` (`/release`)
Plain-language orchestration for the invoking Claude to follow:

1. **Parallel step** (independent of each other):
   - Run `release-scout` to gather and organize unreleased changes.
   - Run `course-api`'s test suite (`npm test`, i.e. `node --test`) to confirm
     the code is release-healthy.
2. **Dependent step** (waits on both of the above):
   - If tests failed: stop, report the failure, do **not** proceed to
     `release-writer`. Don't release on top of a broken build.
   - If `release-scout` reports nothing to release (empty `Unreleased`, no
     unmentioned changes): stop and say so — no-op is a valid outcome.
   - Otherwise: hand the scout's categorized summary to `release-writer`,
     which picks the bump and edits the files.
3. **Report:** the new version number, a one-line summary of what shipped, and
   a reminder to commit, tag, and push.

### 5. Skill — `skills/changelog-format/SKILL.md`
Reference for writing changelog entries consistently — used by
`release-writer` and by anyone editing `CHANGELOG.md` by hand:
- Keep-a-Changelog-style categories: `Added`, `Changed`, `Fixed`, `Removed`,
  `Breaking`.
- One line per entry, user-facing phrasing (what changed for someone using
  the API), not implementation narration.
- The category → semver-bump mapping `release-writer` relies on: any
  `Breaking` entry → major; any `Added`/`Changed` (non-breaking) → minor;
  only `Fixed`/`Removed` (non-breaking) → patch.

### 6. Hook — `hooks/hooks.json` + `hooks/scripts/check-release-freshness.js`
- **Trigger:** `PreToolUse` matcher on `Bash`.
- **Script logic:** parse the tool-call's command; if it isn't a `git push`,
  exit 0 immediately (no-op for every other Bash call). If it is, read
  `course-api/CHANGELOG.md`'s `## [Unreleased]` section — if it has any
  bullet content, block the push (non-zero/blocking exit per Claude Code hook
  convention) with a message pointing to `/release`. Empty `Unreleased` →
  exit 0, push proceeds untouched.
- **Path safety:** script is referenced via
  `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-release-freshness.js` — no
  hardcoded absolute paths (grader checks this).
- Exact hook JSON schema and blocking exit-code convention to be confirmed
  against current Claude Code docs at implementation time.

### 7. `marketplace.json`
Lists `shipwright` with `source: "./"` and a one-line description, `name`
matching `plugin.json` exactly.

## Error handling / edge cases

- **No `CHANGELOG.md` yet:** bootstrapped as part of implementation (see
  Target codebase above), so this shouldn't occur in practice — but
  `release-scout` should treat a missing file the same as an empty
  `Unreleased` section (nothing to report) rather than erroring.
- **Tests fail:** command stops before `release-writer` runs; nothing is
  written.
- **Nothing to release:** command stops after the parallel step; nothing is
  written.
- **Hook on a non-git-push Bash command:** script exits 0 immediately, no
  behavior change for unrelated commands.
- **Hook when `course-api/CHANGELOG.md` is missing:** treat as "nothing
  unreleased," allow the push (fail open, not closed, for a file that simply
  doesn't exist yet).

## Testing plan (Task 5)

1. `cd course-api && npm install` (prerequisite from the assignment).
2. `claude --plugin-dir .` from the repo root.
3. Confirm `release-scout` and `release-writer` appear under their
   namespaced names; confirm `/release` fires and orchestrates them in order
   (parallel scout+tests, then dependent writer).
4. Exercise the hook: make an `Unreleased` entry, attempt a `git push`,
   confirm it's blocked; run `/release`, confirm the next push goes through.
5. Use `/reload-plugins` while iterating.

## Publishing plan (Task 6)

Add `.claude-plugin/marketplace.json`, commit, push, then in a fresh session
run `/plugin marketplace add <this repo>` and
`/plugin install shipwright@<marketplace name>`, confirm clean install.

## Out of scope / not doing

- No git tagging automation (not requested; tagging stays a manual step the
  command reminds the user about).
- No PR/release-notes publishing to GitHub (not requested).
- No confirmation pause in `release-writer` (explicitly decided against —
  fully automatic).
