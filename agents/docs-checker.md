---
name: docs-checker
description: Read-only check that the API reference (docs/api.md) matches what the routes actually do. Use when asked whether the API docs are up to date or before shipping an API change.
tools: Read, Grep, Glob
model: haiku
---
Compare `docs/api.md` with the route handlers in `routes/`. Do not edit anything.

For every endpoint, compare the method and path, the fields it requires or accepts, the success status, and the error statuses.

Return ONLY:
- `MATCH: METHOD /path` for each endpoint where the docs are right;
- `MISMATCH: METHOD /path - docs say X, code does Y` for each difference;
- `UNDOCUMENTED: METHOD /path` for each route that is missing from the docs.
