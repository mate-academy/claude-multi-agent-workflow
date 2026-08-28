---
name: changelog-conventions
description: Guidance for drafting a CHANGELOG.md entry and deciding semver version bumps following Keep a Changelog conventions.
---

## Keep a Changelog Format

A CHANGELOG.md tracks changes to a project in a human-readable format. Use this structure:

```
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New features or capabilities introduced in this release

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Features or code removed in this release

### Deprecated
- Features that will be removed in a future release

### Security
- Security vulnerability fixes or improvements

## [1.0.0] - 2025-03-15

### Added
- Initial release
```

## Entry Template

For a new release entry, add a section at the top:

```
## [X.Y.Z] - YYYY-MM-DD

### Added
- Feature description
- Another feature

### Changed
- What changed in existing behavior

### Fixed
- Bug that was fixed

### Removed
- Feature that was removed

### Security
- Security fix (if any)
```

Date format: ISO 8601 (YYYY-MM-DD). Use the release date, not the commit date.

## Semantic Versioning (SemVer)

Bump versions according to:

- **MAJOR** (X.0.0): Breaking changes that are not backward compatible
  - Example: Removing an API endpoint, changing function signature
- **MINOR** (0.X.0): New features that are backward compatible
  - Example: Adding a new endpoint, new optional parameter
- **PATCH** (0.0.X): Bug fixes that are backward compatible
  - Example: Fixing a logic error, improving performance

If a release contains multiple types of changes, bump the highest priority:
- Breaking change + new feature = MAJOR bump
- New feature + bug fix = MINOR bump
- Only bug fixes = PATCH bump

## Entry Best Practices

- Write from the user's perspective, not the developer's
  - Good: "Added user authentication endpoint"
  - Bad: "Added line 42 in auth.js"
- Group related changes together
- Keep entries concise (one line per change, preferably)
- Use active voice: "Added", "Fixed", "Changed", not "Adds", "Fixes"
- For bug fixes, mention what the bug was: "Fixed: users could not log out on mobile devices"
