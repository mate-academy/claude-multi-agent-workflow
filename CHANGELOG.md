# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-09

### Added
- Added the plugin manifest (`.claude-plugin/plugin.json`) declaring this as the "release-toolkit" plugin — a release-management workflow that drafts changelogs, bumps versions, and checks release readiness.
- Added a `changelog-writer` subagent that drafts and maintains `CHANGELOG.md`, inspecting `git log` since the last tag (or full history if none), grouping changes into Added/Changed/Fixed/Removed, and rewriting commit messages into user-facing release notes.
- Added a `release-readiness-checker` subagent (read-only) that verifies a release is actually ready to tag: checks that version numbers agree across `package.json` and `.claude-plugin/plugin.json`, confirms `CHANGELOG.md` has a real dated entry (not just an "Unreleased" placeholder) for the current version, and flags blockers like placeholder versions or missing files.
- Added a `/release` workflow command that orchestrates the two subagents end-to-end: runs an initial readiness audit and a changelog draft in parallel, writes the real changelog entry using both results, then re-runs the readiness check to confirm the repo is release-ready before reporting a verdict.
- Added a `check-tag-readiness` pre-tool-use hook that blocks `git tag` commands unless `CHANGELOG.md` already documents the version currently declared in the project manifests, preventing untagged/undocumented releases.
- Added a `semver-bump` skill describing how to decide whether a set of changes is a major, minor, or patch release under semantic versioning, and how to apply that version consistently across `package.json`, `.claude-plugin/plugin.json`, and `CHANGELOG.md`.
- Added an example "Course API" project (`course-api/`) for building and testing the plugin against real code: a small Express app with `/health` and `GET/POST/PUT /users` endpoints backed by an in-memory store, complete with automated tests (Node's test runner + supertest), ESLint config, npm scripts (`dev`, `start`, `test`, `lint`), and documentation (`README.md`, `CLAUDE.md`, `docs/api.md`).
- Added a `Validate plugin` CI workflow (GitHub Actions) that runs a validation script on every push and pull request, checking that the plugin manifest, subagents, workflow command, skill, hook, and marketplace listing are all present and correctly structured.
- Added a `.gitignore` to keep `node_modules/`, log files, OS artifacts, and local Claude settings out of version control.
- Added the project `README.md` describing the assignment: assembling a Claude Code plugin (subagents, a multi-agent workflow command, a skill, and a hook) and publishing it as a marketplace.

### Changed
- Restructured the README's heading levels for correct document hierarchy (top-level heading demoted, section headings adjusted accordingly).
- Updated the README to reference the bundled `course-api/` project instead of an external one, and added its setup step (`cd course-api && npm install`).
- Replaced the manual "How it's checked" review description in the README with an explanation of the automated `Validate plugin` CI check and how to interpret a failing run.
- Updated the submission instructions in the README to require opening a pull request against the main repository rather than just pushing.
