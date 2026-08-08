---
name: changelog-format
description: How to write a changelog entry for course-api — category headings, one-line user-facing phrasing, and the category-to-semver-bump mapping release-writer relies on. Use whenever writing or editing CHANGELOG.md, by hand or via release-writer.
---

# Changelog format

`course-api/CHANGELOG.md` follows a Keep-a-Changelog-style structure: a
running `## [Unreleased]` section at the top, and one
`## [x.y.z] - YYYY-MM-DD` heading per released version below it, newest
first.

## Categories

Use exactly these four headings, at `###` level (nested under `## [Unreleased]`
or a `## [x.y.z]` version heading), in this order, only including ones that
have entries:

- **Added** — new, backward-compatible functionality (a new route, a new
  optional field).
- **Changed** — backward-compatible changes to existing behavior.
- **Fixed** — bug fixes, and any cleanup (including removing something
  unused) that doesn't break an existing caller.
- **Breaking** — anything that breaks an existing caller (a removed route,
  a renamed field, a changed response shape).

## Entry style

One line per bullet, written for someone *calling* the API — not for
someone reading the diff:

- Good: ``Added a `GET /users/:id` endpoint.``
- Bad: `Added getUserById handler and wired it into the router.`

## Version bump mapping

This is the exact rule `release-writer` applies — keep it in sync if either
changes:

| Entries present                        | Bump  |
|-----------------------------------------|-------|
| Any `Breaking`                          | major |
| `Added` and/or `Changed` (no `Breaking`)| minor |
| Only `Fixed`                            | patch |
