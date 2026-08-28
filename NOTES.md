# Release Toolkit Plugin — Design Notes

## Overview

The **release-toolkit** plugin automates release workflows for Node.js codebases. It bundles two subagents (an auditor and a changelog/version manager), a skill documenting changelog conventions, a PostToolUse hook that validates version/changelog sync, and an orchestrated command that runs them as a workflow with parallel and dependent steps.

## Installation and Usage

### Local Testing
```bash
cd course-api
npm install
cd ..
claude --plugin-dir .
/release-toolkit:release
```

### Publishing to a Marketplace
1. Add this repo as a marketplace: `/plugin marketplace add <repo-url>`
2. Install the plugin: `/plugin install release-toolkit@<marketplace-name>`

The `/release-toolkit:release` command then runs the full audit → lint/test → changelog/version-bump workflow.

## Scoping Decisions

### Why release-readiness-auditor is read-only with haiku model

The auditor performs a **mechanical checklist**: reading files, grepping for patterns, comparing version strings. It doesn't need reasoning or decision-making — just extraction and comparison. We scoped it to `Read`, `Grep`, `Glob` tools (read-only) and assigned the `haiku` model because:
- **Task fit**: The job is deterministic and straightforward (check for string matches, list files, compare versions).
- **Cost**: Haiku is faster and cheaper than Sonnet for tasks that don't require deep reasoning.
- **No ambiguity**: The auditor reports facts (file X exists/doesn't exist, version Y is found/not found), not judgments.

### Why changelog-version-bumper needs Bash, Write/Edit, and sonnet model

The version bumper must **reason about commits and make decisions**, then edit files. We scoped it to `Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob` and assigned the `sonnet` model because:
- **Reasoning required**: The agent must parse git history, categorize commits into Added/Changed/Fixed/Removed/Deprecated/Security, apply semver rules (breaking=major, feature=minor, fix=patch), and decide the new version.
- **File editing**: The agent must create or edit `CHANGELOG.md` with structured entries and update `package.json` version strings — requires `Write` and `Edit`.
- **Git access**: The agent runs `git log` and `git diff` to understand what changed since the last release — requires `Bash`.
- **Capability match**: Sonnet's reasoning depth suits the semver decision logic better than Haiku.

## Orchestration Decisions

### Why audit and lint/test run in parallel

Auditing and testing are **independent**:
- The audit examines the codebase structure (version field, changelog file, debug code, test file existence).
- Linting and testing run the code through tools (`eslint`, `node --test`).
- Neither depends on the other's output — they can happen at the same time.

Running them in parallel saves time: instead of audit → lint → test (sequential, slow), both happen concurrently.

### Why changelog/version bump is a dependent step

The changelog/version bump **depends on both parallel steps succeeding**:
- If the audit finds blockers (missing changelog, debug code, uncommitted changes), we should not bump the version.
- If tests fail, we should not bump the version.
- Only if both parallel checks pass cleanly should we proceed to draft the changelog and bump the version.

This gates the potentially-destructive version bump (a commit that will be tagged) behind passing checks, reducing the risk of releasing broken code.

## Hook Implementation

The hook (`PostToolUse` on `Edit|Write` to `course-api/package.json`) runs a bundled Node script (`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-changelog-sync.js`) that:
1. Reads the new version from `course-api/package.json`.
2. Checks if `CHANGELOG.md` exists and has a `## [version]` entry.
3. If either check fails, prints a warning to stdout and exits cleanly (code 0, non-blocking).

This ensures users are reminded to keep the changelog in sync without failing the edit. The warning appears in Claude's tool-use output, making it visible but non-blocking.

## Testing Against the Course API

The `course-api/` directory is a small Express REST API with:
- `server.js`: Express app setup
- `routes/health.js`, `routes/users.js`: Endpoints
- `db/store.js`: In-memory store
- `tests/users.test.js`: Test suite
- `docs/api.md`: Endpoint documentation
- `package.json`: version 1.0.0, scripts `dev`, `start`, `test`, `lint`

The plugin is designed to work against this codebase:
- The audit scans its routes, db, and tests directories.
- The changelog/version bumper reads git history from the repo root (which includes the course-api commits).
- The hook monitors edits to `course-api/package.json` specifically.

## Files Structure

```
.claude-plugin/
  plugin.json         # Plugin manifest (name, version)
  marketplace.json    # Marketplace listing (for installation)

agents/
  release-readiness-auditor.md   # Read-only auditor (haiku)
  changelog-version-bumper.md    # Writer with Bash (sonnet)

commands/
  release.md          # Orchestration: audit+lint/test in parallel, then bumper if both pass

skills/
  changelog-conventions/
    SKILL.md          # Keep a Changelog format, semver rules

hooks/
  hooks.json          # PostToolUse hook on course-api/package.json edits
  scripts/
    check-changelog-sync.js  # Validation script (warns if version/changelog out of sync)

README.md             # Course instructions + plugin overview
NOTES.md              # This file
```

All component folders sit at the repo root; only `plugin.json` and `marketplace.json` live inside `.claude-plugin/` per Claude Code plugin structure.
